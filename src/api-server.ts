import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import fs from 'fs';
import yaml from 'yaml';
import path from 'path';
import { fileURLToPath } from 'url';

import { Plaza } from './index.js';
import { aegisClient } from './shared/aegis-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Plaza
const plaza = new Plaza({
  searchConfig: {
    exa: { apiKey: process.env.EXA_API_KEY || '', enabled: true },
    serper: { apiKey: process.env.SERPER_API_KEY || '', enabled: true },
    perplexity: { apiKey: process.env.PERPLEXITY_API_KEY || '', enabled: true }
  }
});

// Middleware for Zitadel/Aegis auth & logging
const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }

  // Validate via Aegis
  const validation = await aegisClient.validateToken(authHeader);
  if (!validation.valid) {
    res.status(401).json({ error: validation.error || 'Invalid token' });
    return;
  }

  // Authorize via Aegis (Basic check for Plaza access)
  const resource = req.path.split('/')[2] || 'plaza'; // e.g. /v1/scrape -> scrape
  const action = req.method.toLowerCase(); // GET/POST

  // For testing/fallback, if roles is empty, assume default
  const role = (validation.roles && validation.roles.length > 0) ? validation.roles[0] : 'service';

  const authz = await aegisClient.authorize({
    subject_id: validation.subject_id || 'unknown',
    role,
    resource: `plaza:${resource}`,
    action,
  });

  if (!authz.allowed) {
    res.status(403).json({ error: `Forbidden: ${authz.reason}` });
    return;
  }

  (req as any).user = validation;
  next();
};

// Health endpoints (no auth required)
app.get('/healthz', async (req, res) => {
  try {
    // Quick health check with timeout protection
    const status = await Promise.race([
      plaza.healthCheck(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), 3000))
    ]) as any;
    res.status(status.status === 'healthy' ? 200 : 503).json(status);
  } catch (error: any) {
    // Return degraded status instead of failing
    res.status(200).json({
      status: 'degraded',
      message: error.message || 'Health check timed out',
      timestamp: new Date().toISOString(),
      service: 'plaza'
    });
  }
});

app.get('/readyz', (req, res) => {
  // Simple readiness check - server is up and can accept requests
  res.json({ status: 'ready', service: 'plaza', timestamp: new Date().toISOString() });
});

// Load OpenAPI spec
const openapiPath = path.join(__dirname, '..', 'docs', 'openapi.yaml');
let swaggerDocument: any = {};
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');
  swaggerDocument = yaml.parse(file);
}

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Protected API routes
const apiRouter = express.Router();
apiRouter.use(authMiddleware);

apiRouter.post('/scrape', async (req: Request, res: Response): Promise<void> => {
  const { url, options } = req.body;
  const correlationId = (req.headers['x-correlation-id'] as string) || '';

  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }

  try {
    aegisClient.logEvent('tool_invocation', { tool: 'scrape', url }, correlationId);
    const result = await plaza.scraper.scrape(url, options);
    res.json(result);
  } catch (error: any) {
    aegisClient.logEvent('tool_error', { tool: 'scrape', url, error: error.message }, correlationId);
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/search', async (req: Request, res: Response): Promise<void> => {
  const { query, limit } = req.body;
  const correlationId = (req.headers['x-correlation-id'] as string) || '';

  if (!query) {
    res.status(400).json({ error: 'Query is required' });
    return;
  }

  if (!plaza.search) {
    res.status(503).json({ error: 'Search is not configured' });
    return;
  }

  try {
    aegisClient.logEvent('tool_invocation', { tool: 'search', query }, correlationId);
    const result = await plaza.search.search({ query, limit });
    res.json(result);
  } catch (error: any) {
    aegisClient.logEvent('tool_error', { tool: 'search', query, error: error.message }, correlationId);
    res.status(500).json({ error: error.message });
  }
});

app.use('/v1', apiRouter);

const PORT = process.env.PORT || 8000;

// Track initialization state
let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = plaza.init().then(() => {
      isInitialized = true;
    }).catch((error) => {
      console.error('Failed to initialize browser:', error);
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
}

async function run() {
  // Start server immediately (don't wait for browser init)
  app.listen(PORT, () => {
    console.log(`Plaza REST API server listening on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
  });

  // Initialize browser in the background
  ensureInitialized().then(() => {
    console.log('Browser automation initialized successfully');
  }).catch((error) => {
    console.warn('Browser initialization deferred (will retry on first use):', error.message);
  });
}

// Start if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((error) => {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  });
}

export { app };

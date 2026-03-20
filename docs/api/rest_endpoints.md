---
id: plaza-rest-api-endpoints
title: "Plaza REST API Endpoints"
description: "Complete reference for Plaza REST API endpoints including MCP tool registration, tool execution, health checks, and authentication."
tags: [api, rest, endpoints, plaza, mcp, reference]
status: STABLE
last_audited: "2026-03-05"
authoritative_source: "src/api-server.ts"
version: "1.0.0"
---

# Plaza REST API Endpoints

## Base URL

```
http://localhost:8000/v1
```

## Authentication

All API endpoints (except health checks) require JWT Bearer token authentication via Aegis/Atlas.

### Headers

| Header | Value | Description |
|--------|-------|-------------|
| `Authorization` | `Bearer <jwt_token>` | Valid JWT token from Aegis |
| `X-Correlation-Id` | `string` | Optional request tracing ID |

### Authentication Flow

1. Obtain JWT token from Aegis identity provider
2. Include token in `Authorization` header
3. Plaza validates token with Aegis `/auth/validate` endpoint
4. Plaza checks authorization with Aegis `/v1/authorize` endpoint
5. Request proceeds if authorized, otherwise returns 401 or 403

### Error Responses

**401 Unauthorized** - Missing or invalid token
```json
{
  "error": "Missing Authorization header"
}
```

**403 Forbidden** - Token valid but insufficient permissions
```json
{
  "error": "Forbidden: insufficient permissions"
}
```

---

## Health & Readiness

### GET /healthz

Health check endpoint for monitoring service status.

**Authentication:** None

**Response:**

| Status | Description |
|--------|-------------|
| `200 OK` | Service is healthy |
| `503 Service Unavailable` | Service is unhealthy |

**Example Request:**
```bash
curl http://localhost:8000/healthz
```

**Example Response (200):**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "services": {
    "scraper": { "status": "healthy", "message": "Scraper ready" },
    "browser": { "status": "healthy", "message": "Browser ready" },
    "search": { "status": "healthy", "message": "All providers available" }
  }
}
```

**Example Response (503):**
```json
{
  "status": "unhealthy",
  "version": "0.1.0",
  "services": {
    "scraper": { "status": "unhealthy", "message": "Connection timeout" }
  }
}
```

### GET /readyz

Readiness check endpoint for Kubernetes-style readiness probes.

**Authentication:** None

**Response:**

| Status | Description |
|--------|-------------|
| `200 OK` | Service is ready to accept traffic |

**Example Request:**
```bash
curl http://localhost:8000/readyz
```

**Example Response:**
```json
{
  "status": "ready",
  "service": "plaza"
}
```

---

## MCP Tool Execution

### POST /scrape

Scrape content from a URL using the Universal Scraper tool.

**Authentication:** Required (Bearer token)

**Required Role:** Access to `plaza:scrape` resource

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | `string` | Yes | URL to scrape |
| `options` | `object` | No | Scraping options |
| `options.raw` | `boolean` | No | Return raw HTTP response without parsing |

**Request Schema:**
```json
{
  "url": "https://example.com/article",
  "options": {
    "raw": false
  }
}
```

**Response:**

| Status | Description |
|--------|-------------|
| `200 OK` | Successfully scraped content |
| `400 Bad Request` | Missing or invalid URL |
| `401 Unauthorized` | Invalid or missing token |
| `403 Forbidden` | Insufficient permissions |
| `500 Internal Server Error` | Scraping failed |

**Success Response (200):**
```json
{
  "url": "https://example.com/article",
  "finalUrl": "https://example.com/article",
  "statusCode": 200,
  "headers": {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "max-age=3600"
  },
  "contentType": "text/html",
  "content": "Full page content or extracted text...",
  "title": "Article Title",
  "description": "Meta description of the article",
  "metadata": {
    "og:title": "Open Graph Title",
    "og:image": "https://example.com/image.jpg"
  },
  "timestamp": "2026-03-05T12:00:00.000Z",
  "parsed": {
    "title": "Article Title",
    "description": "Meta description",
    "text": "Clean extracted text content...",
    "links": [
      { "href": "https://example.com/page1", "text": "Page 1" }
    ],
    "images": [
      { "src": "https://example.com/img.jpg", "alt": "Image description" }
    ],
    "metadata": {
      "author": "John Doe"
    }
  }
}
```

**Raw Response (options.raw: true):**
```json
{
  "url": "https://example.com/api/data",
  "finalUrl": "https://example.com/api/data",
  "statusCode": 200,
  "headers": {
    "content-type": "application/json"
  },
  "contentType": "application/json",
  "content": "{\"key\": \"value\"}",
  "timestamp": "2026-03-05T12:00:00.000Z"
}
```

**Error Response (500):**
```json
{
  "error": "Request timeout after 30000ms"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:8000/v1/scrape \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -H "X-Correlation-Id: abc-123" \
  -d '{
    "url": "https://example.com/article",
    "options": {
      "raw": false
    }
  }'
```

### POST /search

Perform a web search using configured providers (Exa, Serper, Perplexity).

**Authentication:** Required (Bearer token)

**Required Role:** Access to `plaza:search` resource

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | `string` | Yes | Search query string |
| `limit` | `number` | No | Maximum results to return (default: 10) |

**Request Schema:**
```json
{
  "query": "artificial intelligence trends 2026",
  "limit": 5
}
```

**Response:**

| Status | Description |
|--------|-------------|
| `200 OK` | Search completed successfully |
| `400 Bad Request` | Missing or invalid query |
| `401 Unauthorized` | Invalid or missing token |
| `403 Forbidden` | Insufficient permissions |
| `503 Service Unavailable` | Search not configured or all providers failed |
| `500 Internal Server Error` | Search execution failed |

**Success Response (200):**
```json
{
  "query": "artificial intelligence trends 2026",
  "results": [
    {
      "id": "exa_001",
      "title": "Top AI Trends Shaping 2026",
      "url": "https://techblog.com/ai-trends-2026",
      "snippet": "As we enter 2026, artificial intelligence continues to evolve...",
      "domain": "techblog.com",
      "publishedDate": "2026-01-15T10:30:00Z",
      "score": 0.95,
      "provider": "exa",
      "metadata": {
        "highlights": ["AI ethics", "Multimodal models"]
      }
    },
    {
      "id": "serper_001",
      "title": "AI Industry Report 2026",
      "url": "https://industryreport.com/ai-2026",
      "snippet": "Comprehensive analysis of AI market trends for 2026...",
      "domain": "industryreport.com",
      "score": 0.88,
      "provider": "serper"
    }
  ],
  "totalResults": 2,
  "providers": ["exa", "serper"],
  "failedProviders": ["perplexity"],
  "duration": 1250
}
```

**Error Response (503):**
```json
{
  "error": "Search is not configured"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:8000/v1/search \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning best practices",
    "limit": 10
  }'
```

---

## MCP Tool Registration (Future)

The following endpoints are planned for dynamic MCP tool registration:

### GET /tools

List all registered MCP tools.

**Authentication:** Required (Bearer token)

**Response Schema (Planned):**
```json
{
  "tools": [
    {
      "name": "universal_scrape",
      "description": "Scrape content from a URL",
      "inputSchema": {
        "type": "object",
        "properties": {
          "url": { "type": "string" },
          "raw": { "type": "boolean" }
        },
        "required": ["url"]
      },
      "version": "1.0.0",
      "enabled": true
    }
  ]
}
```

### POST /tools

Register a new MCP tool.

**Authentication:** Required (Bearer token + admin role)

**Request Schema (Planned):**
```json
{
  "name": "custom_data_processor",
  "description": "Process custom data formats",
  "inputSchema": {
    "type": "object",
    "properties": {
      "data": { "type": "string" },
      "format": { "type": "string", "enum": ["json", "xml"] }
    },
    "required": ["data", "format"]
  },
  "handler": "https://handler-service/process",
  "version": "1.0.0"
}
```

### DELETE /tools/{name}

Unregister an MCP tool.

**Authentication:** Required (Bearer token + admin role)

---

## API Documentation

### GET /docs

Interactive Swagger UI documentation.

**Authentication:** None

**Description:** Provides a web-based UI for exploring and testing all API endpoints. Served by `swagger-ui-express`.

---

## Data Models

### ScrapedContent

```typescript
interface ScrapedContent {
  url: string;              // Original URL
  finalUrl: string;         // URL after redirects
  statusCode: number;       // HTTP status code
  headers: Record<string, string>;
  contentType: string;
  content: string;          // Raw or extracted content
  title?: string;           // Page title (HTML only)
  description?: string;     // Meta description
  metadata?: Record<string, string>;
  timestamp: string;        // ISO 8601 timestamp
  parsed?: ParsedHtml;      // Structured HTML data
  pdfContent?: PdfContent;  // PDF extraction data
}
```

### ParsedHtml

```typescript
interface ParsedHtml {
  title: string | null;
  description: string | null;
  text: string;             // Clean text content
  links: Array<{ href: string; text: string }>;
  images: Array<{ src: string; alt: string }>;
  metadata: Record<string, string>;
}
```

### SearchResponse

```typescript
interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  providers: string[];      // Providers that responded
  failedProviders: string[]; // Providers that failed
  duration: number;         // Query duration in ms
}
```

### SearchResult

```typescript
interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  domain: string;
  publishedDate?: string;   // ISO 8601 timestamp
  score: number;            // Relevance score (0-1)
  provider: string;
  metadata?: Record<string, unknown>;
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",        // Optional: machine-readable code
  "details": {}                // Optional: additional context
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_URL` | 400 | URL parameter is required |
| `MISSING_QUERY` | 400 | Query parameter is required |
| `INVALID_URL` | 400 | URL format is invalid |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_CONFIGURED` | 503 | Service not configured |
| `PROVIDER_ERROR` | 500 | External provider error |
| `TIMEOUT` | 500 | Request timeout |

---

## Rate Limiting

API requests are subject to rate limiting based on the authenticated subject:

| Tier | Requests/Minute | Requests/Hour |
|------|-----------------|---------------|
| `service` | 100 | 5,000 |
| `user` | 30 | 1,000 |
| `admin` | 500 | 25,000 |

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709641200
```

---

## SDK Examples

### Python

```python
import requests

API_BASE = "http://localhost:8000/v1"
TOKEN = "your_jwt_token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Scrape a URL
response = requests.post(
    f"{API_BASE}/scrape",
    headers=headers,
    json={"url": "https://example.com", "options": {"raw": False}}
)
data = response.json()
print(data["title"], data["content"])

# Search
response = requests.post(
    f"{API_BASE}/search",
    headers=headers,
    json={"query": "AI news", "limit": 5}
)
results = response.json()["results"]
for result in results:
    print(f"{result['title']}: {result['url']}")
```

### TypeScript/JavaScript

```typescript
const API_BASE = "http://localhost:8000/v1";
const TOKEN = "your_jwt_token";

const headers = {
  "Authorization": `Bearer ${TOKEN}`,
  "Content-Type": "application/json"
};

// Scrape a URL
const scrapeResponse = await fetch(`${API_BASE}/scrape`, {
  method: "POST",
  headers,
  body: JSON.stringify({ 
    url: "https://example.com", 
    options: { raw: false }
  })
});
const scrapeData = await scrapeResponse.json();
console.log(scrapeData.title, scrapeData.content);

// Search
const searchResponse = await fetch(`${API_BASE}/search`, {
  method: "POST",
  headers,
  body: JSON.stringify({ query: "AI news", limit: 5 })
});
const searchData = await searchResponse.json();
searchData.results.forEach((result: any) => {
  console.log(`${result.title}: ${result.url}`);
});
```

---

## Related Documentation

- [MCP Server Architecture](./../architecture/mcp_server.md)
- [OpenAPI Specification](./../openapi.yaml)
- [CONTEXT.md](./../../CONTEXT.md) - Project overview
- [Aegis/Atlas Documentation](https://github.com/nizamiq/atlas) - Authentication details

---
id: plaza-mcp-server-architecture
title: "Plaza MCP Server Architecture"
description: "Architecture documentation for Plaza as an MCP tooling platform, including component design, tool registration flow, and Aegis integration."
tags: [architecture, mcp, plaza, mcp-server, tooling-platform, aegis]
status: STABLE
last_audited: "2026-03-26"
authoritative_source: "src/mcp-server.ts"
version: "1.0.1"
---

# Plaza MCP Server Architecture

## Overview

Plaza is the central **MCP (Model Context Protocol) Tooling Platform** for the NizamIQ ecosystem. It provides a suite of production-grade tools exposed as MCP services that can be consumed by any agent or service within the ecosystem. The platform is built on **TypeScript/Node.js** with **Express.js** for REST APIs and integrates with **Aegis** for authentication and authorization.

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Runtime** | Node.js | 18+ |
| **Language** | TypeScript | 5.3+ |
| **REST Framework** | Express.js | 5.2+ |
| **MCP SDK** | @modelcontextprotocol/sdk | 1.27+ |
| **Browser Automation** | Playwright | 1.40+ |
| **Web Scraping** | Axios, Cheerio | Latest |
| **Validation** | Zod | 4.3+ |
| **Authentication** | Aegis integration | - |

## Core Components

### 1. MCP Server (`src/mcp-server.ts`)

The MCP Server is the primary interface for MCP-compatible clients. It exposes tools via the Model Context Protocol using stdio transport.

**Key Features:**
- **Stdio Transport**: Communicates via standard input/output for seamless integration with MCP clients
- **Tool Registration**: Dynamic tool discovery via `ListToolsRequestSchema`
- **Tool Execution**: Handles tool invocations via `CallToolRequestSchema`
- **Error Handling**: Structured error responses using MCP error codes

**Registered Tools:**
| Tool Name | Description | Input Schema |
|-----------|-------------|--------------|
| `universal_scrape` | Scrape content from any URL | `{ url: string, raw?: boolean }` |
| `web_search` | Multi-provider web search | `{ query: string, numResults?: number }` |

### 2. REST API Server (`src/api-server.ts`)

The REST API provides HTTP endpoints for tool execution, secured by Aegis authentication.

**Key Features:**
- **JWT Authentication**: Token validation via Aegis
- **Authorization**: Role-based access control (RBAC) for resources
- **Rate Limiting**: Built-in rate limiting for API protection
- **Swagger UI**: Interactive API documentation at `/docs`
- **Health Checks**: Kubernetes-compatible health endpoints

### 3. Universal Scraper (`src/universal-scraper/`)

A robust web scraping module supporting both HTML and PDF content extraction.

**Capabilities:**
- HTTP content fetching with retry logic
- HTML parsing and metadata extraction
- PDF text extraction
- Configurable timeouts, headers, and proxy support

**Supported Content Types:**
- `text/html` - Parsed with Cheerio for structured extraction
- `application/pdf` - Text extraction with metadata
- Raw HTTP responses (optional)

### 4. Browser Automation (`src/browser-automation/`)

Playwright-powered browser automation for complex interactions.

**Capabilities:**
- Multi-browser support (Chromium, Firefox, WebKit)
- Session management
- Screenshot capture (PNG/JPEG, full page or element)
- PDF generation
- Form interactions and element clicking
- Anti-detection measures for bot protection bypass

**Anti-Detection Features:**
- `navigator.webdriver` property override
- Plugin spoofing
- Permission API mocking
- `--disable-blink-features=AutomationControlled` flag

### 5. Web Search (`src/web-search/`)

Multi-provider search aggregation with fallback support.

**Supported Providers:**
| Provider | Description | Status |
|----------|-------------|--------|
| **Exa** | AI-powered search | Configurable |
| **Serper** | Google Search API | Configurable |
| **Perplexity** | AI answer engine | Configurable |

**Features:**
- Provider health monitoring
- Automatic failover between providers
- Result deduplication and ranking
- Configurable result limits and time ranges

## Architecture Diagram: Tool Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MCP Client (e.g., Claude Desktop)                 │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ Stdio Transport
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Plaza MCP Server                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  MCP Protocol Handler                                               │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │   │
│  │  │ ListTools       │  │ CallTool        │  │ Error Handling      │ │   │
│  │  │ RequestSchema   │  │ RequestSchema   │  │ (McpError)          │ │   │
│  │  └────────┬────────┘  └────────┬────────┘  └─────────────────────┘ │   │
│  │           │                    │                                    │   │
│  │           ▼                    ▼                                    │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Tool Registry                            │   │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │   │
│  │  │  │ universal_   │  │ web_search   │  │ (Extensible)     │  │   │   │
│  │  │  │ scrape       │  │              │  │                  │  │   │   │
│  │  │  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │   │   │
│  │  │         │                 │                                │   │   │
│  │  └─────────┼─────────────────┼────────────────────────────────┘   │   │
│  │            │                 │                                     │   │
│  └────────────┼─────────────────┼─────────────────────────────────────┘   │
│               │                 │                                         │
│               ▼                 ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        Plaza Core (src/index.ts)                    │  │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────┐ │  │
│  │  │ Universal       │  │ Playwright       │  │ SearchAggregator    │ │  │
│  │  │ Scraper         │  │ Wrapper          │  │                     │ │  │
│  │  │ (Axios/Cheerio) │  │ (Browser Auto)   │  │ (Exa/Serper/Perplex)│ │  │
│  │  └─────────────────┘  └──────────────────┘  └─────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Tool Execution
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           External Services                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Web Pages   │  │ PDF Docs    │  │ Search APIs │  │ Browser Instances   │ │
│  │ (HTTP/HTTPS)│  │ (S3/URLs)   │  │ (Exa/Serper)│  │ (Playwright)        │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Tool Registration Flow

### Step 1: Tool Discovery

When an MCP client connects, it sends a `ListToolsRequest` to discover available tools:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'universal_scrape',
        description: 'Scrape content from a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to scrape' },
            raw: { type: 'boolean', description: 'Extract raw HTTP response' }
          },
          required: ['url']
        }
      },
      // ... more tools
    ]
  };
});
```

### Step 2: Tool Invocation

When a client invokes a tool, the server validates inputs using Zod schemas and routes to the appropriate handler:

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'universal_scrape') {
    const args = ScrapeSchema.parse(request.params.arguments);
    const result = await plaza.scraper.scrape(args.url, { raw: args.raw });
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
  // ... other tools
});
```

### Step 3: Response Formatting

All tool responses follow the MCP content format:

```typescript
{
  content: [
    { type: 'text', text: string },
    { type: 'image', data: string, mimeType: string },
    // ...
  ],
  isError?: boolean
}
```

## Aegis Integration

Plaza integrates with **Aegis** for token validation, authorization checks, and audit logging.

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│ Plaza API   │────▶│   Aegis     │
│             │     │   Server    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │ Authorization:    │ POST /auth/       │
       │ Bearer <token>    │    validate       │
       │                   │                   │
       │                   │◀─── Token Valid ──┤
       │                   │   (subject_id,    │
       │                   │    roles)         │
       │                   │                   │
       │                   │ POST /v1/         │
       │                   │ authorize         │
       │                   │ (RBAC check)      │
       │                   │                   │
       │                   │◀─── Allow/Deny ───┤
       │                   │                   │
       │◀── Response ──────┤                   │
       │ (or 401/403)      │                   │
```

### Authorization Model

Plaza uses resource-based authorization:

- **Resource Pattern**: `plaza:{tool}` (e.g., `plaza:scrape`, `plaza:search`)
- **Actions**: `get`, `post`, `put`, `delete`
- **Roles**: Derived from JWT token (e.g., `service`, `admin`, `user`)

### Logging and Auditing

All tool invocations are logged to Aegis for audit trails:

```typescript
aegisClient.logEvent('tool_invocation', { 
  tool: 'scrape', 
  url 
}, correlationId);
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Kubernetes Cluster                          │
│                                                                  │
│  ┌─────────────────────┐      ┌─────────────────────┐           │
│  │   Plaza MCP Server  │      │   Plaza REST API    │           │
│  │   (StatefulSet)     │      │   (Deployment)      │           │
│  │                     │      │                     │           │
│  │   Port: stdio       │      │   Port: 8000        │           │
│  │   Replicas: 1       │      │   Replicas: 3+      │           │
│  └─────────────────────┘      └─────────────────────┘           │
│           │                            │                         │
│           └────────────┬───────────────┘                         │
│                        │                                         │
│           ┌────────────▼───────────────┐                        │
│           │    Redis (Caching)         │                        │
│           └────────────────────────────┘                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Ingress Controller                    │    │
│  │         (Routes to REST API, excludes MCP)              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | REST API server port | `8000` |
| `EXA_API_KEY` | Exa search API key | - |
| `SERPER_API_KEY` | Serper.dev API key | - |
| `PERPLEXITY_API_KEY` | Perplexity API key | - |
| `AEGIS_BASE_URL` | Aegis service URL | `http://localhost:8080` |
| `AEGIS_API_KEY` | Aegis API key | - |

### MCP Server Configuration

The MCP server is configured via `stdio` transport and requires no additional network configuration. It reads environment variables for API keys and service endpoints.

## Extending Plaza

To add a new tool to Plaza:

1. **Implement the Tool**: Create a new module in `src/` or extend existing services
2. **Register in MCP Server**: Add tool definition to `ListToolsRequestSchema` handler
3. **Add Execution Handler**: Implement tool logic in `CallToolRequestSchema` handler
4. **Add REST Endpoint** (optional): Create endpoint in `api-server.ts` for HTTP access
5. **Update Tests**: Add unit and integration tests
6. **Document**: Update this architecture document and API documentation

## Related Documentation

- [REST API Endpoints](./../api/rest_endpoints.md)
- [OpenAPI Specification](./../openapi.yaml)
- [CONTEXT.md](./../../CONTEXT.md) - Project overview and commands
- [Aegis Documentation](https://github.com/nizamiq/Aegis) - Authentication details

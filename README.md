---
id: plaza-readme-v1
title: "Plaza: The NizamIQ Tooling Platform"
description: "Human-readable project overview for the Plaza MCP tooling platform."
tags: [readme, plaza, mcp, tooling, overview]
status: DRAFT
last_audited: "2026-03-04"
authoritative_source: "README.md"
version: 1.0.0
---

# Plaza

**The Generic MCP Tooling Platform for the NizamIQ Ecosystem**

Plaza provides the fundamental, domain-agnostic MCP (Model Context Protocol) tools that empower AI agents to interact with the digital world.

## Overview

Born from the February 2026 ecosystem audit, Plaza was created to extract and centralize the generic, reusable MCP tools previously embedded in `meridian-prime`. It serves as the definitive, standalone platform for all foundational agent tooling.

## Key Features

| Feature | Description |
| :--- | :--- |
| **MCP Tooling** | Provides a suite of generic, domain-agnostic tools for AI agents |
| **Extracted from `meridian-prime`** | Formalizes and centralizes the core tooling from the legacy system |
| **Standalone Service** | A dedicated platform for all foundational agent tooling |

## Quick Start

### Option 1: Docker (Fastest)

```bash
docker run -d -p 8000:8000 ghcr.io/nizamiq/plaza:latest
curl http://localhost:8000/healthz
```

### Option 2: Docker Compose

```bash
git clone https://github.com/nizamiq/Plaza.git
cd Plaza
cp .env.example .env
# Edit .env with your API keys

docker-compose -f deploy/docker-compose/docker-compose.yml up -d
```

### Option 3: Kubernetes

```bash
kubectl apply -k deploy/k8s/overlays/development
kubectl port-forward svc/plaza 8000:8000 -n plaza-dev
```

### Option 4: Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python -m src.main

# Run tests
pytest
```

See [QUICKSTART.md](./QUICKSTART.md) and [deploy/docs/DEPLOYMENT.md](./deploy/docs/DEPLOYMENT.md) for detailed deployment instructions.

## Architecture

Plaza is a headless Python service built on FastAPI.

- **API:** MCP (Model Context Protocol)
- **Authentication:** Delegates to Zitadel via the Aegis SDK

## Ecosystem Context

Plaza is a core component of the NizamIQ Masterplan. For strategic context, see:
- [nizamiq-strategy](https://github.com/nizamiq/nizamiq-strategy)
- [Ecosystem Architecture](https://github.com/nizamiq/nizamiq-strategy/blob/main/03_technical/ecosystem_architecture.md)

## Documentation

- [CONTEXT.md](./CONTEXT.md) - AI agent entry point
- [AGENTS.md](./AGENTS.md) - Agent scope check and guidelines
- [docs/architecture/](./docs/architecture/) - System design documents
- [docs/api/](./docs/api/) - API contracts

## Deployment

Plaza supports multiple deployment methods:

- **Docker** - Single container for simple deployments
- **Docker Compose** - Full stack with Redis and monitoring
- **Kubernetes** - Production-ready with Kustomize overlays
- **Helm** - Coming soon

See the [deploy/](deploy/) directory for all deployment configurations.

## Documentation

- [CONTEXT.md](./CONTEXT.md) - AI agent entry point
- [AGENTS.md](./AGENTS.md) - Agent scope check and guidelines
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [deploy/docs/DEPLOYMENT.md](./deploy/docs/DEPLOYMENT.md) - Deployment guide
- [docs/architecture/](./docs/architecture/) - System design documents
- [docs/api/](./docs/api/) - API contracts

## License

Plaza is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

Additional terms apply for API provider compliance (Exa, Serper, Perplexity).

## Status

**Phase:** 03 - Packaging & Deployment  
**Status:** COMPLETE

All phases (00-03) have been completed. Plaza is ready for production deployment.

---

*Plaza - The foundational tooling platform for the NizamIQ ecosystem.*

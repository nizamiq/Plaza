# Plaza Deployment

This directory contains all deployment configurations for the Plaza MCP Tooling Platform.

## Overview

Plaza supports multiple deployment methods:

1. **Docker** - Single container deployment
2. **Docker Compose** - Local development and testing
3. **Kubernetes** - Production deployment with Kustomize
4. **Helm** - Alternative Kubernetes deployment (future)

## Quick Start

### Docker Compose (Recommended for Local Development)

```bash
# Start all services
docker-compose -f deploy/docker-compose/docker-compose.yml up -d

# View logs
docker-compose -f deploy/docker-compose/docker-compose.yml logs -f plaza

# Stop services
docker-compose -f deploy/docker-compose/docker-compose.yml down
```

### Kubernetes (Production)

```bash
# Deploy to development namespace
kubectl apply -k deploy/k8s/overlays/development

# Deploy to production namespace
kubectl apply -k deploy/k8s/overlays/production
```

## Directory Structure

```
deploy/
├── docker-compose/       # Docker Compose configurations
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
├── k8s/                  # Kubernetes manifests with Kustomize
│   ├── base/             # Base resources
│   ├── overlays/         # Environment-specific patches
│   │   ├── development/
│   │   ├── staging/
│   │   └── production/
│   └── infrastructure/   # External dependencies (Redis, etc.)
└── helm/                 # Helm chart (future)
```

## Configuration

### Environment Variables

See `.env.example` in the repository root for all available environment variables.

### Secrets Management

For production deployments, use:

- **Kubernetes**: External Secrets Operator or Sealed Secrets
- **Docker Compose**: Environment files (`.env`)

## Monitoring

Plaza exposes the following endpoints:

- `/healthz` - Health check endpoint
- `/readyz` - Readiness probe
- `/metrics` - Prometheus metrics (if enabled)
- `/docs` - Swagger UI documentation

## License

See LICENSE file in the repository root.

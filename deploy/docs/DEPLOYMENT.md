---
id: plaza-deployment-guide
title: "Plaza Deployment Guide"
description: "Comprehensive guide for deploying Plaza MCP Platform in various environments."
tags: [deployment, docker, kubernetes, documentation]
status: STABLE
last_audited: "2026-02-25"
authoritative_source: "deploy/docs/DEPLOYMENT.md"
version: 1.0.0
---

# Plaza Deployment Guide

This guide covers deploying the Plaza MCP Tooling Platform in different environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Deployment](#docker-deployment)
3. [Docker Compose Deployment](#docker-compose-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Configuration](#configuration)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **CPU**: 2+ cores (4+ recommended for production)
- **Memory**: 2GB RAM minimum (4GB+ recommended)
- **Disk**: 10GB free space
- **Network**: Internet access for API calls

### Required Software

- Docker 20.10+ (for containerized deployment)
- Docker Compose 2.0+ (for local development)
- kubectl 1.25+ (for Kubernetes deployment)
- Kustomize 4.0+ (for Kubernetes manifest management)

### API Keys (Optional)

For full functionality, obtain API keys for:
- [Exa](https://exa.ai) - Web search
- [Serper](https://serper.dev) - Google search
- [Perplexity](https://perplexity.ai) - AI-powered search

## Docker Deployment

### Quick Start

```bash
# Pull and run the latest image
docker run -d \
  --name plaza \
  -p 8000:8000 \
  -e EXA_API_KEY=your_key \
  ghcr.io/nizamiq/plaza:latest

# Check health
curl http://localhost:8000/healthz
```

### Production Docker Run

```bash
docker run -d \
  --name plaza \
  --restart always \
  -p 8000:8000 \
  -e NODE_ENV=production \
  -e LOG_LEVEL=warn \
  -e EXA_API_KEY=$EXA_API_KEY \
  -e SERPER_API_KEY=$SERPER_API_KEY \
  -e PERPLEXITY_API_KEY=$PERPLEXITY_API_KEY \
  -e RATE_LIMIT_REQUESTS_PER_MINUTE=1000 \
  --memory=4g \
  --cpus=2.0 \
  ghcr.io/nizamiq/plaza:latest
```

## Docker Compose Deployment

### Local Development

```bash
# Clone repository
git clone https://github.com/nizamiq/Plaza.git
cd Plaza

# Copy environment file
cp .env.example .env
# Edit .env with your API keys

# Start services
docker-compose -f deploy/docker-compose/docker-compose.yml up -d

# View logs
docker-compose -f deploy/docker-compose/docker-compose.yml logs -f

# Access API
curl http://localhost:8000/healthz
curl http://localhost:8000/docs  # Swagger UI
```

### Production with Docker Compose

```bash
# Use production configuration
docker-compose -f deploy/docker-compose/docker-compose.prod.yml up -d
```

### With Monitoring Stack

```bash
# Start with Prometheus and Grafana
docker-compose -f deploy/docker-compose/docker-compose.yml --profile monitoring up -d

# Access Grafana at http://localhost:3000
# Default credentials: admin/admin
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster 1.25+
- kubectl configured
- Ingress controller (nginx recommended)
- cert-manager (for TLS)

### Development Deployment

```bash
# Deploy to development namespace
kubectl apply -k deploy/k8s/overlays/development

# Verify deployment
kubectl get pods -n plaza-dev
kubectl get svc -n plaza-dev

# Port forward for local access
kubectl port-forward svc/plaza 8000:8000 -n plaza-dev
```

### Staging Deployment

```bash
# Deploy to staging namespace
kubectl apply -k deploy/k8s/overlays/staging

# Verify
kubectl get pods -n plaza-staging
kubectl rollout status deployment/plaza -n plaza-staging
```

### Production Deployment

```bash
# IMPORTANT: Update secrets before deploying
kubectl create secret generic plaza-secrets \
  --from-literal=EXA_API_KEY=your_exa_key \
  --from-literal=SERPER_API_KEY=your_serper_key \
  --from-literal=PERPLEXITY_API_KEY=your_perplexity_key \
  --from-literal=AEGIS_API_KEY=your_aegis_key \
  -n plaza-prod

# Deploy to production
kubectl apply -k deploy/k8s/overlays/production

# Verify rollout
kubectl rollout status deployment/plaza -n plaza-prod
```

### Using Deployment Script

```bash
cd deploy

# Deploy to development
./deploy.sh development

# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh production
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `8000` |
| `LOG_LEVEL` | Logging level | `info` |
| `EXA_API_KEY` | Exa search API key | - |
| `SERPER_API_KEY` | Serper API key | - |
| `PERPLEXITY_API_KEY` | Perplexity API key | - |
| `AEGIS_ENABLED` | Enable Aegis auth | `false` |
| `AEGIS_URL` | Aegis service URL | - |
| `AEGIS_API_KEY` | Aegis API key | - |

### Configuring Search Providers

Enable search providers by setting the appropriate environment variables:

```bash
# Enable Exa
export EXA_API_KEY=your_exa_key
export EXA_ENABLED=true

# Enable Serper
export SERPER_API_KEY=your_serper_key
export SERPER_ENABLED=true

# Enable Perplexity
export PERPLEXITY_API_KEY=your_perplexity_key
export PERPLEXITY_ENABLED=true
```

## Monitoring

### Health Endpoints

- `GET /healthz` - Health check (returns 200 if healthy)
- `GET /readyz` - Readiness probe (returns 200 when ready)
- `GET /docs` - Swagger UI documentation

### Prometheus Metrics

If metrics are enabled:
- `GET /metrics` - Prometheus metrics endpoint

### Logging

Plaza uses structured logging. Log levels:
- `error` - Errors only
- `warn` - Warnings and errors
- `info` - General information (default)
- `debug` - Detailed debugging

### Kubernetes Monitoring

```bash
# View pod logs
kubectl logs -f deployment/plaza -n plaza-prod

# View pod metrics
kubectl top pods -n plaza-prod

# Describe pod for debugging
kubectl describe pod <pod-name> -n plaza-prod
```

## Troubleshooting

### Docker Issues

**Container exits immediately:**
```bash
# Check logs
docker logs plaza

# Verify environment variables
docker inspect plaza | grep -A 20 Env
```

**Out of memory:**
```bash
# Increase memory limit
docker run --memory=4g ...
```

### Kubernetes Issues

**Pod stuck in Pending:**
```bash
# Check events
kubectl get events -n plaza-prod --sort-by=.lastTimestamp

# Check resource quotas
kubectl describe resourcequota -n plaza-prod
```

**Pod CrashLoopBackOff:**
```bash
# Check logs
kubectl logs -p deployment/plaza -n plaza-prod

# Check events
kubectl describe pod <pod-name> -n plaza-prod
```

**ImagePullBackOff:**
```bash
# Verify image exists
docker pull ghcr.io/nizamiq/plaza:latest

# Check image pull secrets
kubectl get secrets -n plaza-prod
```

### API Issues

**Authentication errors:**
- Verify `AEGIS_ENABLED` setting
- Check Aegis service connectivity
- Validate API keys

**Rate limiting:**
- Adjust `RATE_LIMIT_REQUESTS_PER_MINUTE`
- Check `RATE_LIMIT_CONCURRENT` settings

## Security Considerations

1. **Never commit API keys** to version control
2. **Use secrets management** in production (Kubernetes Secrets, Vault, etc.)
3. **Enable TLS** for production deployments
4. **Restrict network access** using NetworkPolicies
5. **Run as non-root** user (already configured in containers)

## Support

For issues and feature requests:
- GitHub Issues: https://github.com/nizamiq/Plaza/issues
- Documentation: https://github.com/nizamiq/Plaza/tree/main/docs

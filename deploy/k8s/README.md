---
id: plaza-k8s-readme
title: "Plaza Kubernetes Deployment"
description: "Kubernetes-specific documentation for Plaza deployment."
tags: [kubernetes, deployment, kustomize]
status: STABLE
last_audited: "2026-02-25"
authoritative_source: "deploy/k8s/README.md"
version: 1.0.0
---

# Plaza Kubernetes Deployment

This directory contains Kubernetes manifests for deploying Plaza using Kustomize.

## Structure

```
k8s/
├── base/                  # Base resources
│   ├── namespace.yaml
│   ├── serviceaccount.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   ├── pdb.yaml
│   ├── ingress.yaml
│   └── kustomization.yaml
├── overlays/              # Environment-specific overlays
│   ├── development/
│   ├── staging/
│   └── production/
└── infrastructure/        # Optional infrastructure components
    ├── external-secrets.yaml
    └── network-policy.yaml
```

## Base Resources

The `base/` directory contains the canonical resource definitions:

- **namespace.yaml**: Namespace definition
- **serviceaccount.yaml**: Service account for pods
- **configmap.yaml**: Non-sensitive configuration
- **secret.yaml**: Sensitive data (override in overlays)
- **deployment.yaml**: Main application deployment
- **service.yaml**: ClusterIP service
- **hpa.yaml**: Horizontal Pod Autoscaler
- **pdb.yaml**: Pod Disruption Budget
- **ingress.yaml**: Ingress configuration

## Overlays

Overlays customize the base for specific environments:

### Development
- Single replica
- Debug logging
- Lower resource limits

### Staging
- Two replicas
- Info logging
- Moderate resources

### Production
- Three+ replicas
- Warning logging
- Higher resource limits
- Higher rate limits

## Deployment Commands

```bash
# Development
kubectl apply -k overlays/development

# Staging
kubectl apply -k overlays/staging

# Production
kubectl apply -k overlays/production
```

## Secrets Management

### Option 1: kubectl (Manual)

```bash
kubectl create secret generic plaza-secrets \
  --from-literal=EXA_API_KEY=xxx \
  --from-literal=SERPER_API_KEY=xxx \
  --from-literal=PERPLEXITY_API_KEY=xxx \
  -n plaza-prod
```

### Option 2: External Secrets Operator

See `infrastructure/external-secrets.yaml` for example configuration.

## Updating Deployments

```bash
# Update image tag in overlay
kustomize edit set image ghcr.io/nizamiq/plaza:v1.0.0

# Apply changes
kubectl apply -k .

# Monitor rollout
kubectl rollout status deployment/plaza

# Rollback if needed
kubectl rollout undo deployment/plaza
```

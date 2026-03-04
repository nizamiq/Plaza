#!/bin/bash
#
# Deploy Plaza to Kubernetes
# Usage: ./deploy.sh [environment]
# Environments: development, staging, production

set -e

ENVIRONMENT=${1:-development}
NAMESPACE="plaza-${ENVIRONMENT}"

echo "========================================"
echo "Deploying Plaza to ${ENVIRONMENT}"
echo "========================================"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo "Error: Invalid environment. Use: development, staging, or production"
    exit 1
fi

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl not found"
    exit 1
fi

# Check kustomize
if ! command -v kustomize &> /dev/null; then
    echo "Warning: kustomize not found, trying kubectl built-in..."
    KUSTOMIZE="kubectl apply -k"
else
    KUSTOMIZE="kustomize build | kubectl apply -f -"
fi

echo ""
echo "Step 1: Applying Kustomize configuration..."
cd "$(dirname "$0")/k8s/overlays/${ENVIRONMENT}"

if command -v kustomize &> /dev/null; then
    kustomize build | kubectl apply -f -
else
    kubectl apply -k .
fi

echo ""
echo "Step 2: Waiting for deployment to be ready..."
kubectl rollout status deployment/plaza -n "${NAMESPACE}" --timeout=300s

echo ""
echo "Step 3: Verifying deployment..."
kubectl get pods -n "${NAMESPACE}"
kubectl get svc -n "${NAMESPACE}"

echo ""
echo "========================================"
echo "Deployment to ${ENVIRONMENT} complete!"
echo "========================================"
echo ""
echo "Useful commands:"
echo "  kubectl get pods -n ${NAMESPACE}"
echo "  kubectl logs -f deployment/plaza -n ${NAMESPACE}"
echo "  kubectl port-forward svc/plaza 8000:8000 -n ${NAMESPACE}"

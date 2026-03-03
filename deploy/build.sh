#!/bin/bash
#
# Build and push Docker images for Plaza
# Usage: ./build.sh [tag]

set -e

TAG=${1:-latest}
REGISTRY=${REGISTRY:-ghcr.io/nizamiq}
IMAGE_NAME=${IMAGE_NAME:-plaza}

echo "========================================"
echo "Building Plaza Docker Images"
echo "========================================"
echo "Tag: ${TAG}"
echo "Registry: ${REGISTRY}"
echo ""

# Build production image
echo "Building production image..."
docker build \
    --target production \
    -t "${REGISTRY}/${IMAGE_NAME}:${TAG}" \
    -t "${REGISTRY}/${IMAGE_NAME}:latest" \
    -f ../Dockerfile \
    ..

# Build MCP server image
echo "Building MCP server image..."
docker build \
    --target mcp-server \
    -t "${REGISTRY}/${IMAGE_NAME}-mcp:${TAG}" \
    -t "${REGISTRY}/${IMAGE_NAME}-mcp:latest" \
    -f ../Dockerfile \
    ..

echo ""
echo "========================================"
echo "Build complete!"
echo "========================================"
echo ""
echo "To push images:"
echo "  docker push ${REGISTRY}/${IMAGE_NAME}:${TAG}"
echo "  docker push ${REGISTRY}/${IMAGE_NAME}-mcp:${TAG}"
echo ""
echo "Images built:"
docker images "${REGISTRY}/${IMAGE_NAME}*" --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}"

# Multi-stage Dockerfile for Plaza MCP Platform
# Supports both amd64 and arm64 architectures

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 3: Production
FROM mcr.microsoft.com/playwright:v1.59.1-jammy AS production

WORKDIR /app

# Create non-root user
RUN groupadd -r plaza && useradd -r -g plaza plaza

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install Playwright browsers (Chromium only for smaller image)
RUN npx playwright install chromium && \
    npx playwright install-deps chromium

# Change ownership
RUN chown -R plaza:plaza /app

# Switch to non-root user
USER plaza

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --spider -q http://localhost:8000/healthz || exit 1

# Default command
CMD ["node", "./dist/api-server.js"]

# Stage 4: MCP Server (alternative entry point)
FROM production AS mcp-server
CMD ["node", "./dist/mcp-server.js"]

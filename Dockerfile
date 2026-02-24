FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose ports
EXPOSE 8000

# Start API server by default
CMD ["node", "./dist/api-server.js"]

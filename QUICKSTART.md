# Plaza Quick Start

Get Plaza MCP Platform running in minutes.

## Option 1: Docker (Fastest)

```bash
docker run -d -p 8000:8000 ghcr.io/nizamiq/plaza:latest
curl http://localhost:8000/healthz
```

## Option 2: Docker Compose (Recommended)

```bash
# Clone and start
git clone https://github.com/nizamiq/Plaza.git
cd Plaza
cp .env.example .env
# Edit .env with your API keys

docker-compose -f deploy/docker-compose/docker-compose.yml up -d
```

## Option 3: Kubernetes

```bash
kubectl apply -k deploy/k8s/overlays/development
kubectl port-forward svc/plaza 8000:8000 -n plaza-dev
```

## Accessing the API

- **Health Check**: http://localhost:8000/healthz
- **API Docs**: http://localhost:8000/docs
- **REST API**: http://localhost:8000/v1/

## Next Steps

- Read the [full deployment guide](deploy/docs/DEPLOYMENT.md)
- Configure [search providers](deploy/docs/DEPLOYMENT.md#configuring-search-providers)
- Set up [monitoring](deploy/docs/DEPLOYMENT.md#monitoring)

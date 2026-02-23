---
id: plaza-readme-v1
title: "Plaza: MCP Tooling Platform"
description: "Human-readable project overview for the Plaza agentic tooling platform."
tags: [readme, plaza, mcp, overview]
status: DRAFT
last_audited: "2026-02-23"
authoritative_source: "README.md"
version: 1.0.0
---

# Plaza

**The Generic Agentic Tooling Platform for the NizamIQ Ecosystem**

Plaza is a standalone, licensable MCP (Model Context Protocol) tooling platform that provides production-grade tools for AI agents to interact with the digital world.

## Overview

Born from the February 2026 ecosystem audit, Plaza extracts and generalizes the mature MCP tooling layer originally developed in `meridian-prime`. It serves as the central, authoritative tooling platform for the entire NizamIQ ecosystem—and can be licensed as a standalone product.

## Key Features

| Feature | Description |
| :--- | :--- |
| **Universal Scraper** | Robust web scraper handling both HTML and in-transit PDFs |
| **Browser Automation** | Production-grade Playwright integration for complex web interactions |
| **Web Search** | Unified interface to multiple search providers (Exa, Serper, Perplexity) |
| **Data Enrichment** | LinkedIn data scraping and other data enrichment services |
| **Intelligence Search** | Intent detection and cross-referencing capabilities |

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm run test
```

## Architecture

Plaza is designed as a collection of MCP-compatible microservices:

- Each tool is exposed as an MCP service
- Unified configuration and authentication
- Extensible plugin architecture
- Docker containerized for easy deployment

## Ecosystem Context

Plaza is part of the NizamIQ Masterplan. For strategic context, see:
- [nizamiq-strategy](https://github.com/nizamiq/nizamiq-strategy)
- [Ecosystem Architecture](https://github.com/nizamiq/nizamiq-strategy/blob/main/03_technical/ecosystem_architecture.md)

## Documentation

- [CONTEXT.md](./CONTEXT.md) - AI agent entry point
- [AGENTS.md](./AGENTS.md) - Agent scope check and guidelines
- [docs/architecture/](./docs/architecture/) - System design documents
- [docs/api/](./docs/api/) - API contracts

## License

[To be determined - this is a licensable product]

## Status

**Phase:** 01 - Core Services Implementation  
**Status:** IN_PROGRESS

---

*Plaza - Empowering agents to interact with the digital world.*

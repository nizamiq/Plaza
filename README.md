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

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python -m src.main

# Run tests
pytest
```

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

## License

[To be determined]

## Status

**Phase:** 01 - Core Services Implementation  
**Status:** IN_PROGRESS

---

*Plaza - The foundational tooling platform for the NizamIQ ecosystem.*

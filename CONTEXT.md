---
id: plaza-context-v2
title: "Plaza: AI Agent Context"
description: "Primary entry point for AI agents working on the Plaza MCP tooling platform and its TypeScript/Node runtime."
tags: [context, plaza, mcp, agents]
status: STABLE
last_audited: "2026-03-26"
authoritative_source: "CONTEXT.md"
version: 2.0.1
---

# CONTEXT.md (v2.0)

**LAST UPDATED:** 2026-03-26

## 1. System Architecture & Purpose

Plaza is the central, authoritative, and generic **agentic tooling platform** for the NizamIQ ecosystem. It provides a suite of reliable, production-grade tools (as MCP services) that can be consumed by any agent or service. Born from the February 2026 ecosystem audit, Plaza extracts and generalizes the MCP tooling layer originally developed in `meridian-prime`. It serves as a standalone, licensable product offering Tooling-as-a-Service capabilities. It is a key tool consumed by the `Tracer` agentic engine.

## 2. Dependency & Integration Map

- **Language:** TypeScript
- **Frameworks/Runtimes:** Node.js 18+, Express, MCP (Model Context Protocol)
- **Key Libraries:** Playwright, Axios, Cheerio, Zod, Swagger UI
- **Runtime Services:** No required database in the current codebase; Docker Compose includes optional Redis and monitoring services
- **Consumers:** `nizamiq/meridian`, and any other agentic system in the ecosystem.

## 3. Execution Commands

| Action | Command |
| :--- | :--- |
| **Install Dependencies** | `npm install` |
| **Run Tests** | `npm test` |
| **Run Linter** | `npm run lint` |
| **Run Typecheck** | `npm run typecheck` |
| **Build Project** | `npm run build` |
| **Run REST API Locally** | `npx tsx src/api-server.ts` |
| **Run MCP Server Locally** | `npx tsx src/mcp-server.ts` |

## 4. CI/CD Pipeline (NizamIQ Golden Pipeline)

This repository uses the **NizamIQ Golden Pipeline** standard. All pull requests are subject to mandatory gates for code quality, testing, AI review, and security scanning.

-   **Workflow File:** `.github/workflows/ci.yml`

## 5. Project Structure & Key Artefacts

```
Plaza/
├── docs/
│   ├── architecture/     # System design and component diagrams
│   ├── api/              # API contracts and interface definitions
│   └── planning/
│       ├── artefacts/
│       │   └── meridian_prime_porting_plan.md  # Defines the backlog from meridian-prime
│       ├── phases/             # YAML files for each project phase
│       └── manifest.json       # Machine-readable project status
├── src/                  # Source code for MCP services
│   ├── browser-automation/ # Playwright wrapper
│   ├── universal-scraper/  # Axios/Cheerio web scraper
│   └── web-search/         # Exa/Serper/Perplexity aggregator
├── CONTEXT.md            # This file - AI agent entry point
└── README.md             # Human-readable project overview
```

## 6. Key Features & Porting Backlog

Plaza's backlog is now formally defined by the `meridian-prime` porting plan. The core mandate is to port and productionize the generic tools from that pilot project.

| Feature | Porting Status | Source in `meridian-prime` |
| :--- | :--- | :--- |
| **Universal Scraper** | **COMPLETE** (Phase 01) | `mcp_services/universal_scraper` |
| **Browser Automation** | **COMPLETE** (Phase 01) | `mcp_services/playwright_tool` |
| **Web Search** | **COMPLETE** (Phase 01) | `mcp_services/search_tool` |
| **MCP Framework** | **COMPLETE** (Phase 02) | `mcp_services/mcp_framework` |
| **News Search** | **PENDING** | `mcp_services/news_search` |
| **LinkedIn Data Enrichment** | **PENDING** | `mcp_services/linkedin_data` |
| **Datetime Tool** | **PENDING** | `mcp_services/datetime_tool` |

## 7. Current Phase & Key Objectives

**Current Phase:** `03_packaging`

With the core services ported and integrated, the immediate focus is on packaging Plaza for deployment and distribution.

-   **Create Docker Images:** Build optimized, multi-architecture Docker images for all services.
-   **Create Kubernetes Manifests:** Develop production-ready Kubernetes deployment configurations.
-   **Define Licensing Model:** Formalize the licensing terms for both internal and external use.

See the [planning manifest](./docs/planning/manifest.json) and [Phase 03 plan](./docs/planning/phases/phase_03_packaging.yaml) for details.

## Out of Scope

The following are explicit boundaries for this repository. Agents must not implement, refactor, or propose work in these areas without explicit operator authorisation:

- No business logic in MCP tools — thin delegation layer only; tools must delegate to authoritative services
- No direct database access — all data access goes through service APIs
- No authentication implementation — delegate to Aegis SDK
- No AI model calls — tool execution only; inference is Tracer's responsibility

## Ecosystem Dependencies

For the full cross-repo dependency graph, blast-radius index, and critical path analysis, see [`DEPENDENCY_MAP.md`](https://github.com/nizamiq/nizamiq-strategy/blob/main/DEPENDENCY_MAP.md).

> **March 2026 Audit Note:** This repository contains duplicated `zitadel_auth` middleware and is missing `opencode.json`. These issues are slated for remediation in the next phase to comply with ecosystem standards (Aegis SDK adoption and UDS compliance).

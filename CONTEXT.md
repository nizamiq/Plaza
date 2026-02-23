---
id: plaza-context-v1
title: "Plaza: AI Agent Context"
description: "Primary entry point for AI agents working on the Plaza MCP Tooling Platform."
tags: [context, plaza, mcp, agents]
status: DRAFT
last_audited: "2026-02-23"
authoritative_source: "CONTEXT.md"
version: 1.0.0
---

# CONTEXT.md

**LAST UPDATED:** 2026-02-23

## 1. System Architecture

Plaza is the central, authoritative, and generic **agentic tooling platform** for the NizamIQ ecosystem. It provides a suite of reliable, production-grade tools (as MCP services) that can be consumed by any agent or service. Born from the February 2026 ecosystem audit, Plaza extracts and generalizes the MCP tooling layer originally developed in `meridian-prime`. It serves as a standalone, licensable product offering Tooling-as-a-Service capabilities.

## 2. Dependency Map

- **Languages:** TypeScript/JavaScript, Python
- **Frameworks/Runtimes:** Node.js, MCP (Model Context Protocol)
- **Key Libraries:** Playwright, Axios, Cheerio, Puppeteer
- **Databases:** Redis (caching), PostgreSQL (metadata)
- **Cloud Services:** AWS/GCP (deployment), Docker (containerization)

## 3. Execution Commands

| Action | Command |
| :--- | :--- |
| **Install Dependencies** | `npm install` |
| **Run Tests** | `npm test` |
| **Run Linter** | `npm run lint` |
| **Build Project** | `npm run build` |
| **Run Locally** | `npm run dev` |
| **Start MCP Server** | `npm run start:mcp` |

## 4. CI/CD Pipeline

This repository uses the **NizamIQ Golden Pipeline** standard. All pull requests are subject to the following mandatory gates:

| Gate | Name | Description |
| :--- | :--- | :--- |
| 1 | **Code Quality** | Enforces consistent code style and catches basic errors using linters and formatters. |
| 2 | **Verifiable Truth** | Ensures the code functions as expected via unit and integration tests. |
| 3 | **AI Autonomous Review** | Performs deep, semantic code review to identify complex bugs and enforce standards. |
| 4 | **Build & Security** | Verifies that the application builds correctly and scans the final artifact for vulnerabilities. |

**Workflow File:** [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)

## 5. Project Structure

```
Plaza/
├── docs/
│   ├── architecture/     # System design and component diagrams
│   ├── api/              # API contracts and interface definitions
│   ├── governance/       # AI agent instructions and CI/CD standards
│   └── planning/         # Phase definitions, AGENTS.md, DEBT.md, manifest.json
├── src/                  # Source code for MCP services
├── CONTEXT.md            # This file - AI agent entry point
├── README.md             # Human-readable project overview
└── AGENTS.md             # Agent scope check and guidelines
```

## 6. Key Features

- **Universal Scraper:** Robust web scraper handling HTML and in-transit PDFs
- **Browser Automation:** Production-grade Playwright integration
- **Web Search:** Unified interface to multiple search providers (Exa, Serper, Perplexity)
- **Data Enrichment:** LinkedIn data scraping and other enrichment services
- **Intelligence Search:** Intent detection and cross-referencing capabilities

## 7. Current Phase

**Phase 00: Project Initialization**

See [manifest.json](./docs/planning/manifest.json) for detailed phase information.

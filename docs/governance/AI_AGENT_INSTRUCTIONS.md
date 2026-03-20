---
id: plaza-governance-ai-agent-instructions
title: "Plaza AI Agent Instructions"
description: "Operating instructions for AI agents working in the Plaza MCP tooling platform repository."
tags: ["governance", "agents", "plaza", "instructions", "mcp"]
status: STABLE
last_audited: "2026-03-05"
authoritative_source: "AGENTS.md"
version: "1.0.0"
---

# Plaza AI Agent Instructions

## ⚠️ MANDATORY SCOPE CHECK

Before performing any work, verify this repository is in-scope:
- **Human-readable:** [nizamiq-strategy/SCOPE.md](https://github.com/nizamiq/nizamiq-strategy/blob/main/SCOPE.md)
- **Machine-readable:** [nizamiq-strategy/ECOSYSTEM.json](https://github.com/nizamiq/nizamiq-strategy/blob/main/ECOSYSTEM.json)

## Repository Purpose

Plaza is the MCP (Model Context Protocol) Tooling Platform providing generic, domain-agnostic agentic tools including:
- Universal web scraper
- Browser automation (Playwright)
- Web search integration
- Data enrichment services

## Development Guidelines

### Code Standards
- Python 3.11+ with type hints
- FastAPI for REST API
- MCP SDK for tool definitions
- pytest for testing

### Tool Development
- All tools must implement MCP protocol
- Document input/output schemas
- Include usage examples
- Version tool definitions

## CI/CD

All PRs must pass the Golden Pipeline:
1. Code Quality (ruff, mypy)
2. Verifiable Truth (pytest)
3. AI Autonomous Review
4. Build & Security (Docker, Trivy)

## Key Files

- `src/plaza/` - Main application code
- `src/tools/` - MCP tool implementations
- `tests/` - Test suite
- `k8s/` - Kubernetes manifests

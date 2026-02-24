---
id: plaza-debt-v2
title: "Plaza: Technical Debt & Porting Backlog"
description: "Tracking documentation gaps, implementation debt, and the formal porting backlog from meridian-prime."
tags: [debt, plaza, tracking, planning, backlog]
status: ACTIVE
last_audited: "2026-02-24"
authoritative_source: "docs/planning/DEBT.md"
version: 2.0.0
---

# Plaza: Technical Debt & Porting Backlog (v2.0)

This document tracks all technical debt, documentation gaps, and the formal porting backlog for the Plaza project.

## P0: Porting Backlog from `meridian-prime`

The primary source of work for Plaza is the systematic porting and productionizing of generic agentic tools from the `nizamiq/meridian-prime` pilot. The full plan is detailed in [`artefacts/meridian_prime_porting_plan.md`](./artefacts/meridian_prime_porting_plan.md).

| ID | Feature / Tool | Porting Status | Source in `meridian-prime` | Target in `Plaza` |
| :--- | :--- | :--- | :--- | :--- |
| **PLAZA-PORT-001** | Universal Scraper | **COMPLETE** | `mcp_services/universal_scraper` | `src/universal-scraper/` |
| **PLAZA-PORT-002** | Browser Automation | **COMPLETE** | `mcp_services/playwright_tool` | `src/browser-automation/` |
| **PLAZA-PORT-003** | Web Search | **COMPLETE** | `mcp_services/search_tool` | `src/web-search/` |
| **PLAZA-PORT-004** | MCP Framework | **COMPLETE** | `mcp_services/mcp_framework` | `src/mcp-server.ts` |
| **PLAZA-PORT-005** | News Search | `PENDING` | `mcp_services/news_search` | `src/web-search/providers/news.ts` |
| **PLAZA-PORT-006** | LinkedIn Data Enrichment | `PENDING` | `mcp_services/linkedin_data` | `src/data-enrichment/linkedin.ts` |
| **PLAZA-PORT-007** | Datetime Tool | `PENDING` | `mcp_services/datetime_tool` | `src/shared/datetime.ts` |

## P1: Documentation Debt

| ID | Description | Resolution | Status |
| :--- | :--- | :--- | :--- |
| **PLAZA-DEBT-001** | **Missing Architecture Docs:** The `docs/architecture` directory is empty. | Create `system_architecture.md`, `component_diagrams.md`, and `data_flow.md` as planned. | `PENDING` |
| **PLAZA-DEBT-002** | **Missing API Docs:** The `docs/api` directory is empty and the OpenAPI spec is incomplete. | Create `mcp_protocol.md` and `service_interfaces.md`. Auto-generate OpenAPI spec from code. | `PENDING` |

## Change Log

| Version | Date | Author | Changes |
| :--- | :--- | :--- | :--- |
| 2.0.0 | 2026-02-24 | Manus AI | Overhauled document. Added the formal porting backlog from `meridian-prime`. |
| 1.0.0 | 2026-02-23 | Execution Engine Agent | Initial creation. |

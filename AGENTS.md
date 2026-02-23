---
id: plaza-agents-v1
title: "Plaza: AI Agent Guidelines"
description: "Agent guidelines, scope checks, and governance directives for the Plaza MCP Tooling Platform."
tags: [agents, governance, plaza, mcp, scope]
status: DRAFT
last_audited: "2026-02-23"
authoritative_source: "AGENTS.md"
version: 1.0.0
---

# Plaza: AI Agent Guidelines

---

## ⚠️ MANDATORY SCOPE CHECK — READ BEFORE ACTING

> **This repository is part of the NizamIQ ecosystem.**
>
> Before performing any work in any session, you **must** verify that the repository you are working on is listed as **in-scope** in the canonical ecosystem scope document:
>
> - **Human-readable:** [`nizamiq-strategy/SCOPE.md`](https://github.com/nizamiq/nizamiq-strategy/blob/main/SCOPE.md)
> - **Machine-readable:** [`nizamiq-strategy/ECOSYSTEM.json`](https://github.com/nizamiq/nizamiq-strategy/blob/main/ECOSYSTEM.json)
>
> **If a repository is not listed as `in_scope` or `incubating` in `ECOSYSTEM.json`, do not perform any work on it.** Treat it as out of scope by default.
>
> **Active in-scope repositories:** `nizamiq-strategy`, `nizamiq.com`, `nizamiq-methodology`, `anchorlink`, `meridian`, `Fireside`, `Cornerstone`, `Plinth`, `Recce`, `Atlas`, `Aegis`, `gateway-config`, `documentation-standard`
>
> **Incubating repositories (governance setup only, no phase execution without operator authorization):** `autonomous-product-studio`, `Axiom`
>
> **Reference only (read-only, no modifications):** `nizamiq-website`, `meridian-prime`
>
> **Explicitly out of scope:** `sputnik-gateway` and any repository not listed above.

---

## Agent Entry Point

**Start here:** [CONTEXT.md](./CONTEXT.md)

## Current Phase

**Phase 00: Project Initialization**

See [manifest.json](./docs/planning/manifest.json) for detailed phase information.

## Project Purpose

Plaza provides the fundamental tools that empower agents to interact with the digital world. It is the generic, domain-agnostic MCP tooling platform extracted from `meridian-prime` during the February 2026 ecosystem audit.

## Agent Responsibilities

When working on Plaza:

1. **Verify Scope:** Always check ECOSYSTEM.json before starting work
2. **Follow UDS:** Adhere to the Unified Documentation Standard from `documentation-standard`
3. **Update Manifest:** Record progress in the phase YAML files
4. **Log Debt:** Document any gaps in DEBT.md
5. **Maintain Standards:** Follow the NizamIQ Golden Pipeline for all contributions

## Planning Framework

This project uses the NizamIQ Planning Framework:

- **State Block Protocol:** Begin responses with `[STATE: Phase XX | STEP: XX.X | DEPS: OK/STALE]`
- **Verifiable Truth:** Provide proof of work for completed tasks
- **Linear Adherence:** Respect dependencies and execute sequentially
- **Manifest Updates:** Update manifest.json when phases complete

## Related Documents

- [CONTEXT.md](./CONTEXT.md) - System architecture and commands
- [docs/planning/manifest.json](./docs/planning/manifest.json) - Phase tracking
- [docs/planning/DEBT.md](./docs/planning/DEBT.md) - Technical debt log
- [README.md](./README.md) - Human-readable overview

## Change Log

| Version | Date | Author | Changes |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-02-23 | Execution Engine Agent | Initial creation |

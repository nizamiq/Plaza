---
id: plaza-agents-planning-v1
title: "Plaza Planning: AI Agent Guidelines"
description: "Planning-level agent guidelines for the Plaza MCP Tooling Platform."
tags: [agents, governance, plaza, planning]
status: DRAFT
last_audited: "2026-02-23"
authoritative_source: "docs/planning/AGENTS.md"
version: 1.0.0
---

# Plaza Planning: AI Agent Guidelines

This document contains planning-specific agent guidelines for the Plaza project.

## Scope Check

See root [AGENTS.md](../AGENTS.md) for the mandatory scope check.

## Phase Management

When executing phases:

1. Read the current phase YAML file before starting
2. Update task status as you progress
3. Record proof of work for completed tasks
4. Add observations for troubleshooting

## Debt Logging

When discovering gaps:

1. Assign a unique debt ID (e.g., DEBT-001)
2. Describe the gap clearly
3. Estimate effort and priority
4. Link to related phase/task if applicable

## Manifest Maintenance

Update `manifest.json` when:

- A phase is completed
- Phase status changes
- New phases are added
- Strategy sync is performed

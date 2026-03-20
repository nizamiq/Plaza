---
id: plaza-governance-ci-cd-standards
title: "Plaza CI/CD Standards"
description: "Continuous integration and deployment standards for the Plaza MCP platform."
tags: ["governance", "ci-cd", "plaza", "standards", "mcp"]
status: STABLE
last_audited: "2026-03-05"
authoritative_source: ".github/workflows/"
version: "1.0.0"
---

# Plaza CI/CD Standards

## Golden Pipeline

All pull requests must pass these 4 gates:

### Gate 1: Code Quality
- **Tools:** ruff, mypy
- **Checks:** Linting, formatting, type checking
- **Threshold:** Zero errors

### Gate 2: Verifiable Truth
- **Tools:** pytest
- **Checks:** Unit tests, integration tests, MCP protocol validation
- **Threshold:** All tests pass

### Gate 3: AI Autonomous Review
- **Tools:** CodeRabbit, CodeX
- **Checks:** Semantic review, security analysis
- **Threshold:** Zero blockers

### Gate 4: Build & Security
- **Tools:** Docker, Trivy
- **Checks:** Container build, vulnerability scan
- **Threshold:** No critical vulnerabilities

## Workflows

- `.github/workflows/ci.yml` - Main CI pipeline
- `.github/workflows/golden-pipeline.yml` - Golden Pipeline
- `.github/workflows/nizamiq_standard.yml` - Standard checks

## Deployment

- Staging: RKE2 cluster
- Production: Manual approval required
- Tools registered with Atlas after deployment

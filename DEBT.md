---
id: plaza-debt
title: "Plaza: Technical Debt & Gap Register"
description: "Technical debt and gap register, seeded from the February 2026 ecosystem audit."
tags: ["plaza", "debt", "audit"]
status: STABLE
last_audited: "2026-02-24"
authoritative_source: DEBT.md
version: "1.0.0"
---

# Plaza: Technical Debt & Gap Register

This register tracks all known technical debt and gaps for the `Plaza` project. It is seeded from the February 2026 ecosystem audit.

## Open Items

| ID | Priority | Description | Resolution | Status |
| :--- | :--- | :--- | :--- | :--- |
| AUDIT-001 | HIGH | Missing nizamiq_standard.yml Golden Pipeline — only a basic ci.yml is present | To be determined | OPEN |
| AUDIT-002 | HIGH | Missing DEBT.md | To be determined | OPEN |
| AUDIT-003 | HIGH | Missing CHANGELOG.md, SCOPE.md, ECOSYSTEM.md | To be determined | OPEN |
| AUDIT-004 | HIGH | No Kubernetes deployment manifests | To be determined | OPEN |
| AUDIT-005 | HIGH | Aegis integration is in progress but not complete | To be determined | OPEN |

## Change Log

| Version | Date | Author | Changes |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-02-24 | NizamIQ | Initial creation from February 2026 audit findings. |

<<<<<<< HEAD
### DEBT-AUTH-001: Implement Aegis RBAC Integration
- **Description**: Integrate Aegis RBAC enforcement into the Plaza Backend-for-Frontend (BFF) or API routes.
- **Impact**: High - Security vulnerability due to bypassed or missing authentication/authorization.
- **Remediation**: Execute Phase 05 (`phase_05_auth_remediation.yaml`).
- **Status**: Open
=======
## DEBT-API-001: OpenAPI Specification Completeness

| Field | Value |
|-------|-------|
| **ID** | DEBT-API-001 |
| **Severity** | MEDIUM |
| **Priority** | P2 |
| **Category** | API Documentation |
| **Status** | IN_PROGRESS |
| **Discovered** | 2026-03-29 |
| **Discovered By** | NizamIQ OpenAPI Assessment & Governance Remediation Agent |

### Description

The OpenAPI specification for `Plaza` was assessed at **8/10** completeness.
An auto-generated specification has been created at the canonical path but requires human review
to expand schemas from generic `SuccessResponse` to precise, Pydantic-derived models.

### Evidence

- Pre-remediation score: 8/10
- Missing: full request/response schemas, examples, error models
- Missing: CI validation pipeline integration
- Missing: Atlas contract registry registration

### Remediation Steps

1. Review and validate the auto-generated `openapi.yaml`
2. Expand all `SuccessResponse` schemas with precise models
3. Add spectral/openapi-validator to CI pipeline
4. Register spec in Atlas contract registry

### Acceptance Criteria

- [ ] openapi.yaml passes spectral lint with zero errors
- [ ] All endpoints have full request/response schemas
- [ ] Spec registered in Atlas
- [ ] CI validates spec on every PR

---
>>>>>>> main

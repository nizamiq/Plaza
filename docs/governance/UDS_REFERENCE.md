---
id: plaza-uds-reference
title: "Plaza: UDS Reference"
description: "Reference to the Unified Documentation Standard for Plaza."
tags: [governance, plaza, uds, reference]
status: STABLE
last_audited: "2026-02-23"
authoritative_source: "https://github.com/nizamiq/documentation-standard/blob/main/standard/UDS.md"
version: 1.0.0
---

# Plaza: UDS Reference

Plaza follows the **NizamIQ Unified Documentation Standard (UDS)**.

## Authoritative Source

- **Repository:** `nizamiq/documentation-standard`
- **Standard Document:** [`standard/UDS.md`](https://github.com/nizamiq/documentation-standard/blob/main/standard/UDS.md)
- **Templates:** [`templates/`](https://github.com/nizamiq/documentation-standard/blob/main/templates/)

## Key Requirements

1. **YAML Frontmatter:** All `.md` files must include UDS-compliant frontmatter
2. **Required Fields:** `id`, `title`, `description`, `tags`, `status`, `last_audited`, `authoritative_source`, `version`
3. **File Structure:** Follow the mandatory directory structure
4. **CI/CD:** All PRs subject to `doc-lint` validation

## Local Copy

A local copy of the UDS should be maintained by cloning:

```bash
git clone https://github.com/nizamiq/documentation-standard.git
```

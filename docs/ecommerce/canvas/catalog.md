# Micro-Frontend Canvas

> Catalogue MFE for ThreadTales. Product listing, filtering, and product detail page under /catalog including /catalog/item/:id.
One micro-frontend, one canvas. This document captures the key architectural and implementation decisions for this micro-frontend. Create new iterations rather than overwriting previous versions.
>
> _Micro-Frontend Canvas v1.0.0 Luca Mezzalira CC BY-NC 4.0_
> _https://www.buildingmicrofrontends.com_

---

## System Details

| Field | Value |
|-------|-------|
| Software System | ThreadTales ecommerce (reference) |
| Owned by Team | @team-catalog |
| Canvas Date | 2026-07-13 |
| Iteration | 1 |

---

## Micro-Frontend Description

_Name and brief description: what does this MFE do? What user journey or business capability does it enable?_

> Catalogue MFE for ThreadTales. Product list with filters, and item detail page under /catalog/item/:id.

---

## Split Strategy

_Horizontal split (multiple MFEs in the same view) or vertical split (one MFE per view or group of views)?_

> Vertical. Catalogue owns /catalog/* including list and item detail pages.


---

## Boundaries Validation

_Verify the micro-frontend has a minimal API surface, is context-aware and self-contained, coarse-grained in nature, and can be deployed independently._

> Shell owns first path segment only. Catalogue owns deeper routing, state, and data fetching. Minimal mount props.


---

## Dependencies

_External dependencies such as shared libraries, application shell, or APIs._

> Product catalogue API (or fixtures). Shell for platform chrome. Search/filter services.


---

## Communication Methodology

_How data flows into and out of the micro-frontend, including contracts and versioning._

**Inputs:**

> userId (optional), locale, platformBus.


**Outputs:**

> shell:alert for user notifications. URL navigation within /catalog owned by Catalogue router.


**Contracts & Versioning:**

> Do not emit domain events that the shell handles. If peer events exist, they are MFE-to-MFE only on same page.


---

## Organisational Constraints

_Any organisational requirement that limits decision-making freedom (budget, timeline, compliance, team size, mandated tools)._

> Independent deployment. No shell change needed to add new pages under /catalog.


---

## Technical Constraints

_Any technical requirement that restricts decision-making freedom (stack, infrastructure, architectural patterns, SLAs)._

> React, internal router with basename /catalog. Module Federation remote exposes only App entry.


---

## Composition Context

_How is this micro-frontend composed and integrated into the application (e.g., CSR or SSR, Module Federation, transclusion, web components)?_

> Shell route is /catalog/* mapping to Catalogue remote. CSR composition.


---

## Governance & Observability

_How is this MFE monitored, who responds to incidents, and what shared standards are enforced?_

**Observability:**

> Track filter usage, page load, and remote load failures. Capture 404 item ids as metrics.


**Incident Response:**

> Owned by team-catalog for domain issues. Platform team for runtime loader.


**Shared Standards:**

> No cross-imports, no shared store. Performance budget for list page.


---

## Quality Guardrails

_Define the three most important guardrails to implement (e.g., bundle size limits, performance budgets, accessibility standards)._

1. Catalogue owns /catalog/* routes only
2. No version-pinned remote URLs in shell
3. Error boundary in shell around Catalogue mount

---

## Challenges & Risks

_Identify current challenges and risks: organisational, architectural, and technical. Include mitigation strategies._

| Challenge | Type | Mitigation |
|-----------|------|------------|
| Shell starts hard-coding /catalog/item/:id | Arch | Keep shell route at /catalog/* and let Catalogue own item routes. |
| Filter state shared with other MFEs | Arch | Use URL params, not shared stores. |
| Large bundles from product detail | Tech | Code split inside Catalogue. Keep shared deps minimal. |
| | Org / Arch / Tech | |
| | Org / Arch / Tech | |

---

## Canvas History

_Track iterations and key changes over time._

| Iteration | Date | Key Changes |
|-----------|------|-------------|
| 1 | | Initial canvas |

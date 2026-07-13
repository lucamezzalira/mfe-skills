# Micro-Frontend Canvas

> Home MFE for ThreadTales. Landing, featured products, quick navigation into Catalogue, and global promotion slots.
One micro-frontend, one canvas. This document captures the key architectural and implementation decisions for this micro-frontend. Create new iterations rather than overwriting previous versions.
>
> _Micro-Frontend Canvas v1.0.0 Luca Mezzalira CC BY-NC 4.0_
> _https://www.buildingmicrofrontends.com_

---

## System Details

| Field | Value |
|-------|-------|
| Software System | ThreadTales ecommerce (reference) |
| Owned by Team | @team-home |
| Canvas Date | 2026-07-13 |
| Iteration | 1 |

---

## Micro-Frontend Description

_Name and brief description: what does this MFE do? What user journey or business capability does it enable?_

> Home MFE for ThreadTales. Landing, featured products, and entry points into Catalogue and My Account.

---

## Split Strategy

_Horizontal split (multiple MFEs in the same view) or vertical split (one MFE per view or group of views)?_

> Vertical. Home owns / and internal widgets. It is not reused across unrelated domains.


---

## Boundaries Validation

_Verify the micro-frontend has a minimal API surface, is context-aware and self-contained, coarse-grained in nature, and can be deployed independently._

> Mount contract is identifiers only (userId, locale) plus platformBus for shell chrome. Home fetches its own product highlights.


---

## Dependencies

_External dependencies such as shared libraries, application shell, or APIs._

> Shell for chrome, runtime remote discovery. Catalogue APIs for featured listings. Shared design tokens package only.


---

## Communication Methodology

_How data flows into and out of the micro-frontend, including contracts and versioning._

**Inputs:**

> userId (optional for personalisation), locale, platformBus.


**Outputs:**

> shell:alert, shell:modal:* events only. Navigation via URL to /catalog/....


**Contracts & Versioning:**

> Stable mount props schema. No domain objects passed across boundary. Versioned event payloads if emitted.


---

## Organisational Constraints

_Any organisational requirement that limits decision-making freedom (budget, timeline, compliance, team size, mandated tools)._

> Must deploy independently from Catalogue and MyAccount teams. Release cadence weekly.


---

## Technical Constraints

_Any technical requirement that restricts decision-making freedom (stack, infrastructure, architectural patterns, SLAs)._

> React, Module Federation runtime discovery, CSR composition. No SSR required for home in this reference.


---

## Composition Context

_How is this micro-frontend composed and integrated into the application (e.g., CSR or SSR, Module Federation, transclusion, web components)?_

> Client-side composition in shell. Shell routes / to Home remote.


---

## Governance & Observability

_How is this MFE monitored, who responds to incidents, and what shared standards are enforced?_

**Observability:**

> Frontend error logging + perf metrics (LCP/CLS) per route. Remote load failures surfaced as shell:alert.


**Incident Response:**

> Owned by team-home. Shell platform team owns runtime loader incidents.


**Shared Standards:**

> No cross-MFE imports. No shared global stores. A11y baseline and bundle size budget.


---

## Quality Guardrails

_Define the three most important guardrails to implement (e.g., bundle size limits, performance budgets, accessibility standards)._

1. Bundle size budget for Home remote
2. No cross-MFE imports (fitness function)
3. A11y checks for navigation and CTAs

---

## Challenges & Risks

_Identify current challenges and risks: organisational, architectural, and technical. Include mitigation strategies._

| Challenge | Type | Mitigation |
|-----------|------|------------|
| Promotion slot becomes cross-domain reuse request | Arch | Keep it home-only. Extract to shared design system component if truly generic. |
| Home starts depending on Catalogue UI internals | Arch | Only navigate via URL and consume Catalogue APIs, never import Catalogue code. |
| Personalisation requires auth context | Tech | Pass userId only. Home fetches data from its own API using token from storage. |
| | Org / Arch / Tech | |
| | Org / Arch / Tech | |

---

## Canvas History

_Track iterations and key changes over time._

| Iteration | Date | Key Changes |
|-----------|------|-------------|
| 1 | | Initial canvas |

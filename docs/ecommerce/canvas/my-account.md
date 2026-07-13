# Micro-Frontend Canvas

> My Account MFE. Owns /account/* and hosts account navigation. Integrates User Details and Payment Methods as nested remotes or internal modules.
One micro-frontend, one canvas. This document captures the key architectural and implementation decisions for this micro-frontend. Create new iterations rather than overwriting previous versions.
>
> _Micro-Frontend Canvas v1.0.0 Luca Mezzalira CC BY-NC 4.0_
> _https://www.buildingmicrofrontends.com_

---

## System Details

| Field | Value |
|-------|-------|
| Software System | ThreadTales ecommerce (reference) |
| Owned by Team | @team-account |
| Canvas Date | 2026-07-13 |
| Iteration | 1 |

---

## Micro-Frontend Description

_Name and brief description: what does this MFE do? What user journey or business capability does it enable?_

> My Account MFE for ThreadTales. Account area shell under /account/* that links to user details and payment methods.

---

## Split Strategy

_Horizontal split (multiple MFEs in the same view) or vertical split (one MFE per view or group of views)?_

> Vertical for /account/* with optional nested composition for sub-capabilities.


---

## Boundaries Validation

_Verify the micro-frontend has a minimal API surface, is context-aware and self-contained, coarse-grained in nature, and can be deployed independently._

> Shell passes identifiers only. My Account is the owner of account UX and sub-route decisions.


---

## Dependencies

_External dependencies such as shared libraries, application shell, or APIs._

> Account API (profile summary, preferences). Shell platform bus. Optional nested remotes for details/payment.


---

## Communication Methodology

_How data flows into and out of the micro-frontend, including contracts and versioning._

**Inputs:**

> userId (required), locale, platformBus.


**Outputs:**

> shell:alert for global notifications. Account-level events to refresh subviews.


**Contracts & Versioning:**

> If nested remotes are used, MyAccount is the host. Sub-remotes never import from each other.


---

## Organisational Constraints

_Any organisational requirement that limits decision-making freedom (budget, timeline, compliance, team size, mandated tools)._

> Account team owns account area end-to-end. UserDetails and PaymentMethods can be separate teams if needed.


---

## Technical Constraints

_Any technical requirement that restricts decision-making freedom (stack, infrastructure, architectural patterns, SLAs)._

> React, router basename /account. MF remote exposes only App entry.


---

## Composition Context

_How is this micro-frontend composed and integrated into the application (e.g., CSR or SSR, Module Federation, transclusion, web components)?_

> Shell mounts MyAccount at /account/* with ErrorBoundary. MyAccount may mount child remotes.


---

## Governance & Observability

_How is this MFE monitored, who responds to incidents, and what shared standards are enforced?_

**Observability:**

> Track sign-in dependent failures, profile update success rates, and remote load errors.


**Incident Response:**

> Owned by team-account. Child teams own their remotes if split.


**Shared Standards:**

> No domain event handling in shell. No cross-MFE imports. Fitness functions for monorepo boundaries.


---

## Quality Guardrails

_Define the three most important guardrails to implement (e.g., bundle size limits, performance budgets, accessibility standards)._

1. MyAccount owns /account/* routing
2. No leaking payment data outside PaymentMethods
3. Explicit shared allowlist only

---

## Challenges & Risks

_Identify current challenges and risks: organisational, architectural, and technical. Include mitigation strategies._

| Challenge | Type | Mitigation |
|-----------|------|------------|
| Nested remotes create depth > 1 | Arch | Only use nested hosting if teams require it. Otherwise keep as internal modules. |
| Cross-team coordination between account subareas | Org | Define contracts and keep APIs minimal. Avoid shared state. |
| Sensitive data exposure | Tech | Never pass payment method objects across MFEs. Use ids and server fetches. |
| | Org / Arch / Tech | |
| | Org / Arch / Tech | |

---

## Canvas History

_Track iterations and key changes over time._

| Iteration | Date | Key Changes |
|-----------|------|-------------|
| 1 | | Initial canvas |

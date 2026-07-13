# Micro-Frontend Canvas

> Payment Methods sub-capability. List and manage saved payment methods under /account/payment-methods.
One micro-frontend, one canvas. This document captures the key architectural and implementation decisions for this micro-frontend. Create new iterations rather than overwriting previous versions.
>
> _Micro-Frontend Canvas v1.0.0 Luca Mezzalira CC BY-NC 4.0_
> _https://www.buildingmicrofrontends.com_

---

## System Details

| Field | Value |
|-------|-------|
| Software System | ThreadTales ecommerce (reference) |
| Owned by Team | @team-payments |
| Canvas Date | 2026-07-13 |
| Iteration | 1 |

---

## Micro-Frontend Description

_Name and brief description: what does this MFE do? What user journey or business capability does it enable?_

> Payment Methods capability. View, add, and remove saved payment methods under /account/payment-methods.

---

## Split Strategy

_Horizontal split (multiple MFEs in the same view) or vertical split (one MFE per view or group of views)?_

> Usually internal to MyAccount. If split into a remote, it is a child remote of MyAccount.


---

## Boundaries Validation

_Verify the micro-frontend has a minimal API surface, is context-aware and self-contained, coarse-grained in nature, and can be deployed independently._

> Receives userId + platformBus only. Sensitive domain data stays inside this capability.


---

## Dependencies

_External dependencies such as shared libraries, application shell, or APIs._

> Payments API. Tokenisation provider. MyAccount host if remote.


---

## Communication Methodology

_How data flows into and out of the micro-frontend, including contracts and versioning._

**Inputs:**

> userId, locale, platformBus.


**Outputs:**

> account:paymentMethodsUpdated (to MyAccount host) and shell:alert for notifications.


**Contracts & Versioning:**

> Never pass raw payment details across MFEs. Use ids only.


---

## Organisational Constraints

_Any organisational requirement that limits decision-making freedom (budget, timeline, compliance, team size, mandated tools)._

> Owned by payments team. Independent deployment if remote.


---

## Technical Constraints

_Any technical requirement that restricts decision-making freedom (stack, infrastructure, architectural patterns, SLAs)._

> React, strong CSP assumptions. No shared state with other MFEs.


---

## Composition Context

_How is this micro-frontend composed and integrated into the application (e.g., CSR or SSR, Module Federation, transclusion, web components)?_

> Mounted by MyAccount. Shell never handles payment domain events.


---

## Governance & Observability

_How is this MFE monitored, who responds to incidents, and what shared standards are enforced?_

**Observability:**

> Track add/remove success rates, API latency, and client-side validation failures.


**Incident Response:**

> Owned by payments team with on-call rotation.


**Shared Standards:**

> No payment data in logs. Strong boundary enforcement. Security review for changes.


---

## Quality Guardrails

_Define the three most important guardrails to implement (e.g., bundle size limits, performance budgets, accessibility standards)._

1. No PCI data in client logs
2. Minimal mount contract only
3. Feature flags inside MFE only

---

## Challenges & Risks

_Identify current challenges and risks: organisational, architectural, and technical. Include mitigation strategies._

| Challenge | Type | Mitigation |
|-----------|------|------------|
| Security compliance requirements | Org | Define SLAs and review gates. Limit dependencies. |
| Host requests payment objects | Arch | Reject. Host receives only ids or refresh signals. |
| Edge rendering attempted for payments | Arch | Avoid. Use edge only for routing/canary, not payment rendering. |
| | Org / Arch / Tech | |
| | Org / Arch / Tech | |

---

## Canvas History

_Track iterations and key changes over time._

| Iteration | Date | Key Changes |
|-----------|------|-------------|
| 1 | | Initial canvas |

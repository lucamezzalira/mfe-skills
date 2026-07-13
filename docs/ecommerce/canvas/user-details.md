# Micro-Frontend Canvas

> User Details sub-capability. View and edit personal details under /account/details.
One micro-frontend, one canvas. This document captures the key architectural and implementation decisions for this micro-frontend. Create new iterations rather than overwriting previous versions.
>
> _Micro-Frontend Canvas v1.0.0 Luca Mezzalira CC BY-NC 4.0_
> _https://www.buildingmicrofrontends.com_

---

## System Details

| Field | Value |
|-------|-------|
| Software System | ThreadTales ecommerce (reference) |
| Owned by Team | @team-account-details |
| Canvas Date | 2026-07-13 |
| Iteration | 1 |

---

## Micro-Frontend Description

_Name and brief description: what does this MFE do? What user journey or business capability does it enable?_

> User Details capability. View and edit profile details under /account/details.

---

## Split Strategy

_Horizontal split (multiple MFEs in the same view) or vertical split (one MFE per view or group of views)?_

> Usually internal to MyAccount. If split into a remote, it is a child remote of MyAccount.


---

## Boundaries Validation

_Verify the micro-frontend has a minimal API surface, is context-aware and self-contained, coarse-grained in nature, and can be deployed independently._

> Receives userId + platformBus only. Fetches and updates details via its own API calls.


---

## Dependencies

_External dependencies such as shared libraries, application shell, or APIs._

> Profile API. MyAccount host if remote. Shared form components via design system package only.


---

## Communication Methodology

_How data flows into and out of the micro-frontend, including contracts and versioning._

**Inputs:**

> userId, locale, platformBus.


**Outputs:**

> account:userDetailsUpdated (to MyAccount host) and shell:alert for user feedback.


**Contracts & Versioning:**

> Event payloads carry ids only. No shared store. No imports from PaymentMethods.


---

## Organisational Constraints

_Any organisational requirement that limits decision-making freedom (budget, timeline, compliance, team size, mandated tools)._

> Owned by account-details team. Must deploy independently if remote.


---

## Technical Constraints

_Any technical requirement that restricts decision-making freedom (stack, infrastructure, architectural patterns, SLAs)._

> React. May run different React major only if explicitly planned. Keep share scope explicit if needed.


---

## Composition Context

_How is this micro-frontend composed and integrated into the application (e.g., CSR or SSR, Module Federation, transclusion, web components)?_

> Mounted by MyAccount. Shell does not mount it directly unless MyAccount is not a host.


---

## Governance & Observability

_How is this MFE monitored, who responds to incidents, and what shared standards are enforced?_

**Observability:**

> Track update failures and validation errors. Capture API latency.


**Incident Response:**

> Owned by account-details team.


**Shared Standards:**

> No cross-MFE imports. No PII logged in client telemetry.


---

## Quality Guardrails

_Define the three most important guardrails to implement (e.g., bundle size limits, performance budgets, accessibility standards)._

1. No PII in logs
2. Server-side validation mirrored client-side
3. Error boundary at mount in host

---

## Challenges & Risks

_Identify current challenges and risks: organisational, architectural, and technical. Include mitigation strategies._

| Challenge | Type | Mitigation |
|-----------|------|------------|
| PII leakage in telemetry | Tech | Redact fields and log only ids/outcomes. |
| Tight coupling to host routing | Arch | Use relative routes and host-provided basename. |
| Feature flags controlled by shell | Arch | Keep flags inside this MFE. Host only controls navigation. |
| | Org / Arch / Tech | |
| | Org / Arch / Tech | |

---

## Canvas History

_Track iterations and key changes over time._

| Iteration | Date | Key Changes |
|-----------|------|-------------|
| 1 | | Initial canvas |

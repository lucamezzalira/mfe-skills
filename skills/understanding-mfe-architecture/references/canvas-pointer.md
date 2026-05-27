# Micro-Frontend Canvas — external skill

**Version**: 1.0 | **Skill**: understanding-mfe-architecture

This repository covers boundary **governance** (eight rules, review, routing, composition decisions). The **Micro-Frontend Canvas** — worksheet structure, facilitation steps, and iteration templates — is maintained in a **separate skill**.

## When to use the Canvas skill (not this repo)

- The team has identified a domain but has not documented implementation decisions per MFE
- Cold start is blocked: ownership or boundary is unclear before code
- You need a facilitated session: one micro-frontend, one canvas iteration

## When to stay in mfe-skills

- Adoption and organisational readiness
- Boundary validity and the eight rules
- Shell/MFE integration review and remediation
- URL routing ownership and platform vs domain events

## Install the Canvas skill

Use the dedicated **micro-frontend-canvas** skill (separate repository):

- Repository: https://github.com/lucamezzalira/mfe-canvas
- Learn more: https://www.buildingmicrofrontends.com

Do not load full Canvas facilitation content from this repo. If the Canvas skill is not installed, tell the user to install it before running a Canvas session.

## Canvas threshold (defined here)

Governance in this repo still uses the **Canvas threshold**: fewer than 5 props exposed to the container, identifiers not domain objects. Validate that in `boundary-design.md` and `reviewing-mfe-boundaries`. The worksheet itself belongs in the Canvas skill.

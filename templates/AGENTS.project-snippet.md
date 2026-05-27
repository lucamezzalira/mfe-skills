# Paste into your project AGENTS.md or CLAUDE.md (adjust paths and teams)

## MFE architecture (project context)

> **Essential:** mfe-skills provides generic boundary rules. This section tells the agent *your* system. Without it, reviews stay theoretical.

**Toolchain:** Module Federation v2 | Native Federation | Single SPA *(pick one)*

**Shell:** `apps/shell/` — owns first URL segment only (`routes.json`)

**Micro-frontends:**

| MFE | Path prefix | Team | Remote scope |
|-----|-------------|------|----------------|
| home | `/` | @your-org/home-team | `home_mfe` |
| catalog | `/catalog/*` | @your-org/catalog-team | `catalog_mfe` |
| checkout | `/checkout/*` | @your-org/commerce-team | `checkout_mfe` |

**Runtime config:** `apps/shell/public/remotes.json` — update URLs per environment; no version-pinned remotes in shell webpack config.

**Platform bus (shell):** `shell:alert`, `shell:modal:*` only — no `catalog:*` / `checkout:*` handlers in shell code.

**Known exceptions / migration:**

- *(example)* catalog-mfe Rule 5: legacy pinned remote until INFRA-442 completes

**Companion skill:** [micro-frontend-canvas](https://github.com/lucamezzalira/mfe-canvas) for Canvas workshops.

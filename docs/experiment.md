# MFE skills experiment (before / after)

Controlled comparison: two AI agents, identical brief, different governance inputs.

## Setup

| | **Without skills** | **With skills** |
|---|-------------------|-----------------|
| **Brief** | React 19, Module Federation, ecommerce: shell + home MFE + catalog MFE | Same |
| **Governance** | None (tutorial defaults) | `AGENTS.md` + `reviewing-mfe-boundaries` |
| **Output location** | `/tmp/mfe-no-skills-sample` (not in this repo) | `/tmp/mfe-with-skills-sample` (not in this repo) |

Neither sample is committed here — the point is **architectural choices**, not demo UI polish.

## What we measured

1. Cross-boundary imports and exposed module surface  
2. Mount contract (props passed into remotes)  
3. Shared state vs events / URL  
4. Who owns routing (shell vs MFE depth)  
5. Remote URL configuration (build-time vs runtime)  
6. Failure isolation (shell fallbacks)  
7. Shell event handling (platform vs domain)

## Results summary

| Area | Without skills | With skills |
|------|----------------|-------------|
| Cross-MFE imports | Shell imports `catalogMfe/productUtils` | No cross-remote imports |
| Mount contract | `shellUser`, `cart`, `formatPrice`, `onNavigate` | `userId` + `platformBus` (chrome only) |
| Shared state | `window.__SHOP_CART__` | URL + platform events; no shared store |
| Routing | Shell defines home + catalog pages | Shell: `routes.json` first segment only; catalog owns `/catalog/product/:id` |
| New MFE / route | Edit shell `App.tsx` | Add row to `routes.json` + `remotes.json` |
| Remote URLs | Hard-coded in webpack | Runtime `remotes.json` |
| Failure handling | `Suspense` only | Shell `ErrorBoundary` + fallback per remote |
| Shell events | Callbacks / globals | `shell:alert`, `shell:modal:*` — no `catalog:*` in shell |

The without-skills build had **critical** violations (Rules 3 and 4). The with-skills build aligned with the eight boundary rules and allowed catalog sub-routes without redeploying the shell.

## How to reproduce locally

1. Install skills in your agent (see README).  
2. Prompt: *"Build React 19 Module Federation ecommerce with shell, home, and catalog MFEs."*  
3. Compare against a run with skills disabled or without `AGENTS.md`.  
4. Review against the eight rules in `skills/reviewing-mfe-boundaries/references/rules-core.md`.

## Limitations

- Samples are minimal teaching repos, not production platforms.  
- Agent and model version affect exact output.  
- With-skills sample evolved with routing and platform-bus guidance documented in this repo.

See also: README **Why use these skills?** for the public summary table.

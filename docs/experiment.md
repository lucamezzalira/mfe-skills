# MFE skills experiment (before / after)

Controlled comparison: two AI agents, identical brief, different governance inputs.

## Setup

| | **Without skills** | **With skills** |
|---|-------------------|-----------------|
| **Brief** | React 19, Module Federation, ecommerce: shell + home MFE + catalog MFE | Same |
| **Governance** | None (tutorial defaults) | `AGENTS.md` + `reviewing-mfe-boundaries` |
| **Output** | Local sample only (not published) | **[mfe-with-skills](https://github.com/lucamezzalira/mfe-with-skills)** |

The **with-skills** repo is the public proof that governance sticks in a real workspace: ThreadTales reference app, Module Federation 2.0, runtime discovery, vendored `.cursor/skills/` and `.cursor/rules/`, and project-specific `AGENTS.md`. Implementation follows [`docs/SPEC.md`](https://github.com/lucamezzalira/mfe-with-skills/blob/main/docs/SPEC.md) in that repository.

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
| Remote URLs | Hard-coded in webpack | Runtime `remotes.json` / discovery manifest |
| Failure handling | `Suspense` only | Shell `ErrorBoundary` + fallback per remote |
| Shell events | Callbacks / globals | `shell:alert`, `shell:modal:*` — no `catalog:*` in shell |

The without-skills build had **critical** violations (Rules 3 and 4). The with-skills build aligned with the eight boundary rules and allowed catalog sub-routes without redeploying the shell.

## Reference implementation

Clone and explore the with-skills output:

```bash
git clone https://github.com/lucamezzalira/mfe-with-skills.git
```

Notable paths in that repo:

| Path | Purpose |
|------|---------|
| `AGENTS.md` | ThreadTales project context + MFE governance (sections 1–14) |
| `.cursor/skills/` | Vendored `understanding-mfe-architecture`, `reviewing-mfe-boundaries` |
| `.cursor/rules/` | Split rules generated from mfe-skills |
| `docs/SPEC.md` | Ports, discovery manifest, acceptance criteria |
| `templates/frontend-discovery.json.example` | Runtime manifest starter |

## How to reproduce locally

1. Install skills in your agent (see [README](../README.md)).  
2. Prompt: *"Build React 19 Module Federation ecommerce with shell, home, and catalog MFEs."*  
3. Compare against a run with skills disabled or without `AGENTS.md`.  
4. Review against the eight rules in `skills/reviewing-mfe-boundaries/references/rules-core.md`.  
5. Optionally align your layout with [mfe-with-skills](https://github.com/lucamezzalira/mfe-with-skills) (discovery manifest, thin shell, vendored skills).

## Limitations

- Samples are minimal teaching repos, not production platforms.  
- Agent and model version affect exact output.  
- [mfe-with-skills](https://github.com/lucamezzalira/mfe-with-skills) may evolve independently; pin a tag on both repos when comparing.

See also: README **Why use these skills?** for the public summary table.

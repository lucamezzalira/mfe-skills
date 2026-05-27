# MFE skills experiment (before / after)

Controlled comparison: two AI agents, identical brief, different governance inputs.

## Setup

| | **Without skills** | **With skills** |
|---|-------------------|-----------------|
| **Brief** | React 19, Module Federation, ecommerce: shell + home MFE + catalog MFE | Same |
| **Governance** | None (tutorial defaults) | `AGENTS.md` + `reviewing-mfe-boundaries` |
| **Output** | Local sample only (not published) | **[mfe-with-skills](https://github.com/lucamezzalira/mfe-with-skills)** |

### Branches on mfe-with-skills

| Branch | Contents |
|--------|----------|
| [`main`](https://github.com/lucamezzalira/mfe-with-skills/tree/main) | Starting point: `AGENTS.md`, `docs/SPEC.md`, vendored skills — **no application code** |
| [`ecommerce-init-implementation`](https://github.com/lucamezzalira/mfe-with-skills/tree/ecommerce-init-implementation) | **Runnable ThreadTales** — AppShell, five remotes, discovery service, `pnpm start` |

Clone the implementation branch to review or run the with-skills sample:

```bash
git clone -b ecommerce-init-implementation --depth 1 \
  https://github.com/lucamezzalira/mfe-with-skills.git
```

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
| Routing | Shell defines home + catalog pages | Thin shell routes; catalogue owns `/catalogue/*` depth |
| New MFE / route | Edit shell `App.tsx` | Discovery manifest + shell top-level route |
| Remote URLs | Hard-coded in webpack | Runtime `frontend-discovery.json` |
| Failure handling | `Suspense` only | Shell `ErrorBoundary` + fallback per remote |
| Shell events | Callbacks / globals | Platform notifications via AppShell-owned bus |

The without-skills build had **critical** violations (Rules 3 and 4). The with-skills implementation branch aligns with the eight boundary rules.

## Reference implementation (code)

| Path (on `ecommerce-init-implementation`) | Purpose |
|---------------------------------------------|---------|
| `AppShell/` | Host, routes, `RemoteMount`, `MfeErrorBoundary`, federation init |
| `HomeMFE/`, `CatalogueMFE/`, `MyAccount/`, … | Remotes |
| `discovery-service/` | Serves `frontend-discovery.json` |
| `AGENTS.md` | ThreadTales context + mfe-skills governance (§14) |
| `.cursor/skills/` | Vendored skills |
| `docs/SPEC.md` | Full specification |

## How to reproduce locally

1. Install skills in your agent (see [README](../README.md)).  
2. Clone **`ecommerce-init-implementation`** (not `main` alone if you need runnable code).  
3. Prompt: *"Build React Module Federation ecommerce with shell, home, and catalog MFEs."* — with skills + `AGENTS.md` enabled.  
4. Compare against a run without governance.  
5. Review with `skills/reviewing-mfe-boundaries/references/rules-core.md` or the prompts in README **Start Here**.

## Limitations

- Reference app, not a production platform.  
- Agent and model version affect greenfield output.  
- Pin the same branch (or tag) when comparing over time.

See also: README **Why use these skills?** for the public summary table.

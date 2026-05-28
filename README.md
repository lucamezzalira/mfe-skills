# MFE Skills

Micro-frontend architecture governance for AI code assistants.

Two skills that give your code assistant deep knowledge of micro-frontend boundary design, the eight boundary rules from *Building Micro-Frontends* (O'Reilly), violation detection, and remediation patterns. Covers Module Federation v1/v2, Native Federation (Angular), and Single SPA.

**Skills included:**

- **understanding-mfe-architecture** activates on adoption decisions, boundary design, and composition patterns (pairs with the separate **micro-frontend-canvas** skill for Canvas facilitation)
- **reviewing-mfe-boundaries** activates on code review, shell generation, violation detection, and cross-MFE communication

## Why use these skills?

AI assistants are good at scaffolding Module Federation quickly. Without governance, they often produce **tutorial-style micro-frontends** that compile and demo well but erode team autonomy over time.

We ran a controlled experiment: two agents, same brief (React 19, Module Federation, ecommerce shell + home + catalog MFEs). One built **without** these skills; one built **with** `AGENTS.md` and `reviewing-mfe-boundaries`.

**Reference implementation (with skills):** [lucamezzalira/mfe-with-skills](https://github.com/lucamezzalira/mfe-with-skills) — ThreadTales (Module Federation 2.0, runtime discovery, vendored skills + `AGENTS.md`).

| Branch | Purpose |
|--------|---------|
| [`main`](https://github.com/lucamezzalira/mfe-with-skills/tree/main) | Starting point: `AGENTS.md`, `docs/SPEC.md`, skills — no app code |
| [`ecommerce-init-implementation`](https://github.com/lucamezzalira/mfe-with-skills/tree/ecommerce-init-implementation) | **Runnable app** — AppShell + five remotes, discovery service (`pnpm install` / `pnpm start`) |

Use **`ecommerce-init-implementation`** for Start Here and code review; use **`main`** to bootstrap a new project from spec only.

### Before vs after (experiment)

| Area | Without skills | With skills |
|------|----------------|-------------|
| **Cross-MFE imports** | Shell imports `catalogMfe/productUtils` | No imports across remotes; each MFE exposes only its app entry |
| **Mount contract** | `shellUser`, `cart`, `formatPrice`, `onNavigate` | `userId` + `platformBus` (chrome only) |
| **Shared state** | `window.__SHOP_CART__` global singleton | No shared store; URL + platform events |
| **Routing** | Shell knows home + catalog pages | Shell loads **first URL segment only** from `routes.json`; MFE owns `/catalog/product/:id` |
| **Adding a route/MFE** | Edit shell `App.tsx` | Add a row to `routes.json` + `remotes.json` (no shell code for internal pages) |
| **Remote URLs** | Hard-coded in webpack config | Runtime `remotes.json` |
| **Failure handling** | `Suspense` only | Shell `ErrorBoundary` + fallback per remote |
| **Shell events** | N/A (navigation via callbacks/globals) | `shell:alert`, `shell:modal:*` allowed — no `catalog:*` / `checkout:*` in shell |

The without-skills build had **critical boundary violations** (cross-imports, shared state, fat API). The with-skills build aligned with the eight rules and stayed extensible without redeploying the shell for every catalog sub-page. Details: [docs/experiment.md](docs/experiment.md) · code: [mfe-with-skills](https://github.com/lucamezzalira/mfe-with-skills).

### What you get

- **Fewer distributed-monolith traps** — agents stop “sharing utils” and global stores across team boundaries
- **Shell stays thin** — dynamic first-level routes, platform chrome only, no domain logic baked into the host
- **Reviews that mean something** — violations tied to rules, severity, and remediation — not generic React advice
- **Works across assistants** — same governance in Claude Code skills, Cursor `.mdc` rules, and Codex `AGENTS.md`

Pair the skills with your project’s `CLAUDE.md` / `AGENTS.md` (team ownership, toolchain, known exceptions) so the agent applies general rules to *your* system.

**Companion skill:** [micro-frontend-canvas](https://github.com/lucamezzalira/mfe-canvas) — Micro-Frontend Canvas worksheets and facilitation (not included in this repo).

**Optional governance template:** [docs/governance.md](docs/governance.md) — policy YAML + `ts-arch`/`jest` fitness-function starter for teams that want CI enforcement.

## Advanced governance extensions

Beyond the eight core boundary rules, the skills now guide these advanced topics:

- **Feature flags scope** — keep behavioural flags inside the owning MFE; avoid shell/runtime fine-grained orchestration across teams
- **Edge strategy** — use edge compute for routing value (canary, strangler, traffic steering), not as a default rendering choice
- **SSR ownership model** — split by route/domain; teams own runtime responsibilities for their page slices
- **SSR browser composition** — RSC / Islands still require coarse boundaries to avoid shell coordination complexity
- **Fitness functions** — enforce boundaries continuously in monorepos (for example `ts-arch` + `jest`) with policy levels (`critical` fail, `high` review-required, `medium/low` warn)

## Project context is essential (`AGENTS.md`)

Skills teach **generic** MFE governance. Your repo must say **which shell, which MFEs, which teams, which toolchain**.

1. Copy [templates/AGENTS.project-snippet.md](templates/AGENTS.project-snippet.md) into your project `AGENTS.md` or `CLAUDE.md` and fill it in.  
2. Merge the generated summary from [AGENTS.md](AGENTS.md) in this repo (for Codex / always-on context).  
3. Optionally add [templates/routes.json.example](templates/routes.json.example) and [templates/remotes.json.example](templates/remotes.json.example) as a starting point.

Without step 1, the agent will cite rules correctly but misapply them to your system.

## Installation

Distribution is this **public GitHub repository** — no separate host. For teams, vendor `skills/` in git (copy or submodule).

```bash
git clone https://github.com/lucamezzalira/mfe-skills.git /tmp/mfe-skills
```

| Editor | Recommended install |
|--------|---------------------|
| **Cursor** | Copy `skills/*` → `.cursor/skills/` (see [Activating skills](#activating-skills)) |
| **Claude Code** | `/plugin marketplace add` + `/plugin install` |
| **Codex** | Copy `skills/*` → `.codex/skills/` + merge `AGENTS.md` |
| **GitHub Copilot** | Copy key guidance into `.github/copilot-instructions.md` + merge `AGENTS.md` summary |
| **Antigravity** | Copy `skills/*` → `.agents/skills/` |

**Optional (Cursor):** copy split rules from `.cursor/rules/` in this repo into your project `.cursor/rules/` — smaller context per topic than one monolithic file.

---

### Claude Code

```bash
/plugin marketplace add lucamezzalira/mfe-skills
/plugin install mfe-skills@mfe-skills
/reload-plugins
```

Skills are namespaced, e.g. `/mfe-skills:reviewing-mfe-boundaries`.

---

### Cursor (recommended: project skills)

From your **project root**:

```bash
mkdir -p .cursor/skills
cp -r /tmp/mfe-skills/skills/understanding-mfe-architecture .cursor/skills/
cp -r /tmp/mfe-skills/skills/reviewing-mfe-boundaries .cursor/skills/
```

Commit `.cursor/skills/`. This matches [Cursor’s documented skills layout](https://cursor.com/docs/plugins) and works the same as other SKILL.md ecosystems.

**Teams / plugin:** import `https://github.com/lucamezzalira/mfe-skills` in Dashboard → Plugins, or symlink for local dev: `ln -sf "$(pwd)" ~/.cursor/plugins/local/mfe-skills`

---

### OpenAI Codex

```bash
mkdir -p .codex/skills
cp -r /tmp/mfe-skills/skills/understanding-mfe-architecture .codex/skills/
cp -r /tmp/mfe-skills/skills/reviewing-mfe-boundaries .codex/skills/
```

Merge [AGENTS.md](AGENTS.md) into your project `AGENTS.md` (do not overwrite existing content).

---

### GitHub Copilot

Copilot uses repository instruction files. Use both:

- `.github/copilot-instructions.md` (Copilot-native baseline)
- `AGENTS.md` (canonical cross-agent governance baseline)

```bash
mkdir -p .github
cp /tmp/mfe-skills/.github/copilot-instructions.md .github/copilot-instructions.md
cp /tmp/mfe-skills/AGENTS.md AGENTS.md
```

Then edit your project `AGENTS.md` with ownership/toolchain details (same guidance as `templates/AGENTS.project-snippet.md`) and keep `.github/copilot-instructions.md` concise.

---

### Google Antigravity

```bash
mkdir -p .agents/skills
cp -r /tmp/mfe-skills/skills/understanding-mfe-architecture .agents/skills/
cp -r /tmp/mfe-skills/skills/reviewing-mfe-boundaries .agents/skills/
```

---

## Activating skills

How the agent actually picks up governance after files are on disk:

| Editor | Activation |
|--------|------------|
| **Cursor** | **Agent decides** from each skill’s `description` in YAML frontmatter, or invoke **`/understanding-mfe-architecture`** / **`/reviewing-mfe-boundaries`**. Optional: copy `.cursor/rules/*.mdc` — rules use **Agent decides** mode per file. Check **Settings → Rules** to see loaded rules/skills. |
| **Claude Code** | Auto when relevant after plugin install, or **`/mfe-skills:understanding-mfe-architecture`** / **`/mfe-skills:reviewing-mfe-boundaries`**. |
| **Codex** | **`AGENTS.md`** loaded every session; skills in `.codex/skills/` when the tool supports them. |
| **GitHub Copilot** | Uses `.github/copilot-instructions.md` as repository-level guidance; also benefits from `AGENTS.md` in supported Copilot agent flows. Paste boundary prompts in Copilot Chat and ask for rule-cited reviews. |
| **Antigravity** | Skills under `.agents/skills/` discovered per Antigravity conventions; combine with project `AGENTS.md`. |

**Prompt to verify:** *Review this shell integration against the eight MFE boundary rules and cite rule numbers.*

## Versioning

| Mechanism | Use |
|-----------|-----|
| **`package.json` version** (e.g. `1.0.0`) | Source of truth for releases |
| **Git tags** (`v1.0.0`) | Pin teams/submodules: `git checkout v1.0.0` |
| **Plugin manifests** | `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json` — kept in sync with `package.json` |
| **SKILL.md `metadata.version`** | Per-skill semver in frontmatter (optional fine-grained tracking) |

**Recommended for teams:** git submodule or copy `skills/` at a tag; bump deliberately after reading release notes.

**Generated files** (`.cursor/rules/`, root `AGENTS.md`) are rebuilt on push to `main` — pin tags if you vendor generated outputs too.

See [CONTRIBUTING.md](CONTRIBUTING.md) for bump checklist. **Tag a release only when `skills/` changes** — **Actions → Release (skill version bump)** (not for README/CI-only commits).

## Optional governance template

If your organisation wants executable boundary governance (policy + allowlists + architecture tests), use the template in [`governance-template/`](governance-template/) and follow [docs/governance.md](docs/governance.md).

## Experiment (before / after)

We ran two agents on the same Module Federation brief — with and without these skills. Full write-up: [docs/experiment.md](docs/experiment.md). Summary table: [Why use these skills?](#why-use-these-skills) above.

| Repo / branch | Role |
|---------------|------|
| [mfe-with-skills `ecommerce-init-implementation`](https://github.com/lucamezzalira/mfe-with-skills/tree/ecommerce-init-implementation) | **With skills** — runnable ThreadTales (MF 2.0, discovery, `userId` + `platformBus`, shell error boundaries) |
| [mfe-with-skills `main`](https://github.com/lucamezzalira/mfe-with-skills/tree/main) | Governance + spec only (starting point) |
| *(local / unpublished)* | **Without skills** — same brief, tutorial-style violations (see experiment doc) |

## Start Here (~15 min)

Walkthrough from clone to a first governed **code** review. **Tested** on branch [`ecommerce-init-implementation`](https://github.com/lucamezzalira/mfe-with-skills/tree/ecommerce-init-implementation): `pnpm install`, `pnpm run build`, AppShell + remotes present, shell `MfeErrorBoundary`, mount props `userId` + `platformBus`. **You** still confirm skills load in your editor (Cursor Settings → Rules).

`main` on [mfe-with-skills](https://github.com/lucamezzalira/mfe-with-skills) is spec + governance only — **check out the implementation branch** for this walkthrough.

### 0) Clone the implementation branch (~2 min)

Skills and `AGENTS.md` are already vendored on this branch — no copy from `mfe-skills` required for the demo.

```bash
git clone -b ecommerce-init-implementation --depth 1 \
  https://github.com/lucamezzalira/mfe-with-skills.git
cd mfe-with-skills
```

Open this folder in **Cursor** (not the `mfe-skills` repo).

Optional — run the app (two terminals):

```bash
pnpm install
pnpm run start:discovery   # terminal 1 (port 2099)
pnpm start                 # terminal 2 → http://localhost:2000/
```

### 1) Pick one target flow

Example: **Home** (`/`) → **Catalogue** (`/catalogue/...`) → **Account** (`/account/...` with nested UserDetails / UserPaymentMethods). See `AGENTS.md` §1.1 and `AppShell/src/App.jsx` routes.

### 2) First architecture prompt

With skills active (or `/reviewing-mfe-boundaries`):

```text
Using mfe-skills governance, analyze this repository:
1) business boundaries and candidate MFEs,
2) anti-patterns against the 8 boundary rules (cite rule numbers),
3) remediation steps.
Review AppShell/, remote MFE folders, and frontend-discovery.json.
```

**Expected:** ThreadTales boundary map; citations for discovery manifest, thin shell routes, `platformBus`; no generic essay.

**Verify skills loaded:** answer cites rule numbers (1–8) and references this repo’s patterns (e.g. `frontend-discovery.json`, not a generic `routes.json` unless you use one).

### 3) Boundary-focused code review prompt

Point the agent at real code, e.g. `AppShell/src/components/RemoteMount.jsx`, `AppShell/src/federation/`, and one remote’s entry:

```text
Review AppShell remote loading and mount props against the 8 MFE boundary rules:
- cross-MFE imports and shared state,
- API surface size (props into remotes),
- shell-level error boundaries and fallbacks.
Provide go/no-go with rule numbers.
```

**Expected on this branch:** **Go** on core rules — e.g. `userId` + `platformBus` only, `MfeErrorBoundary` in shell, runtime discovery (no static remotes in AppShell webpack).

### 4) Project context

[mfe-with-skills `AGENTS.md`](https://github.com/lucamezzalira/mfe-with-skills/blob/ecommerce-init-implementation/AGENTS.md) is the filled ThreadTales example. For **your** app, start from [templates/AGENTS.project-snippet.md](templates/AGENTS.project-snippet.md).

### 5) Definition of done (first adoption)

On one user journey, confirm in **code**:

- No Rule 3 or 4 violations (no cross-MFE imports, no shared store)
- Shell wraps each remote mount with an error boundary
- MFE contracts use identifiers, not domain objects
- One team owns each deployed MFE

On `ecommerce-init-implementation`, use step 3 to verify; extend the checklist when you add new remotes or routes.

## Updating

| Assistant | How to update |
|-----------|----------------|
| **Claude Code** | `/plugin marketplace update mfe-skills` then `/reload-plugins` |
| **Cursor / Codex / Antigravity** | Re-run install `cp` from a fresh clone or bump git submodule tag |
| **GitHub Copilot** | Re-copy latest `.github/copilot-instructions.md` and re-merge latest `AGENTS.md` |
| **Cursor rules** | Re-copy `.cursor/rules/` from latest `main` or run `npm run build` in this repo |
| **AGENTS.md** | Re-merge generated [AGENTS.md](AGENTS.md) from this repo |

## What the skills cover

### understanding-mfe-architecture

Activates when you ask about adoption, boundary design, or communication patterns.

- The canonical micro-frontend definition and six characteristics
- Organisational readiness gate (when NOT to use micro-frontends)
- Vertical vs horizontal split strategies
- Client-side vs server-side composition
- Pointer to the separate **micro-frontend-canvas** skill (Canvas worksheets live there)
- Communication patterns: events, web storage, URL

### reviewing-mfe-boundaries

Activates when you review or generate code that crosses a team deployment boundary.

- Eight boundary rules with violation signals and severity levels
- Multi-toolchain code patterns (Module Federation v1/v2, Native Federation, Single SPA)
- Cold start checks: team ownership, domain identification, decisions framework
- Remediation patterns: step-by-step fixes for every rule violation
- Boundary health checklist (7 yes/no questions)

## Repository structure

```
.claude-plugin/
  marketplace.json                     # Claude Code plugin catalog metadata
  plugin.json
.cursor-plugin/
  plugin.json                          # Cursor plugin manifest
.cursor/rules/                         # Generated split Cursor rules (npm run build)
skills/                                # Source of truth — install these into your project
  understanding-mfe-architecture/
    SKILL.md                           # Skill entry point
    references/
      boundary-design.md               # Canonical MFE definition
      canvas-pointer.md                # Link to micro-frontend-canvas skill (no full Canvas here)
      decisions-framework.md           # Composition and communication decisions
      rules.md                         # Quick-reference boundary rules
  reviewing-mfe-boundaries/
    SKILL.md                           # Skill entry point
    references/
      rules-core.md                    # Eight rules: definitions and violation signals
      rules-toolchain.md               # Framework-specific code patterns
      routing-ownership.md             # Shell first URL segment; MFE sub-routes; platform events
      remediation.md                   # Fix patterns for every rule violation
rules/
  mfe-core-concepts.mdc                # Generated Cursor rules (plugin + optional project copy)
  mfe-boundary-health.mdc
AGENTS.md                              # Generated Codex / always-on summary (npm run build)
templates/                             # Project AGENTS snippet, routes.json, remotes.json
docs/
  experiment.md                        # Before/after agent experiment
scripts/
  build-cursor.js                      # → .cursor/rules/*.mdc (split)
  build-agents.js                      # → AGENTS.md
  validate.js                          # Contributor checks
  smoke-test.js
.github/workflows/build-dist.yml
CONTRIBUTING.md
```

`skills/` is the source of truth. On push to `main`, CI runs `npm run build` and commits `.cursor/rules/` + `AGENTS.md`.

Contributing: [CONTRIBUTING.md](CONTRIBUTING.md).

## Pairing with CLAUDE.md / AGENTS.md

Use [templates/AGENTS.project-snippet.md](templates/AGENTS.project-snippet.md) as the starting point. The generated [AGENTS.md](AGENTS.md) in this repo is the **portable rules summary**; your project file is the **map of your system**. Both together produce useful reviews.

## Resources

- Book: [Building Micro-Frontends](https://www.buildingmicrofrontends.com/book)
  A practical guide to designing, delivering, and governing micro-frontends at scale.
- Podcast: [Micro-frontends podcast playlist](https://www.youtube.com/playlist?list=PLQCXBpGR5h_jHo1xbShq3EWOKw38UPCEZ)
  Conversations with practitioners about architecture trade-offs, team topology, and real-world adoption.
- Newsletter: [Building Micro-Frontends newsletter](https://www.buildingmicrofrontends.com)
  Ongoing insights, patterns, and field notes from enterprise micro-frontend implementations.

## Author

Luca Mezzalira, luca@50cents.media

Based on *Building Micro-Frontends* (O'Reilly). Canvas facilitation: [micro-frontend-canvas](https://github.com/lucamezzalira/mfe-canvas).

## License

[MIT](LICENSE) — Copyright (c) 2026 Luca Mezzalira.

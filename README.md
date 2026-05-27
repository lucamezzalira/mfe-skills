# MFE Skills

Micro-frontend architecture governance for AI code assistants.

Two skills that give your code assistant deep knowledge of micro-frontend boundary design, the eight boundary rules from *Building Micro-Frontends* (O'Reilly), violation detection, and remediation patterns. Covers Module Federation v1/v2, Native Federation (Angular), and Single SPA.

**Skills included:**

- **understanding-mfe-architecture** activates on adoption decisions, boundary design, and composition patterns (pairs with the separate **micro-frontend-canvas** skill for Canvas facilitation)
- **reviewing-mfe-boundaries** activates on code review, shell generation, violation detection, and cross-MFE communication

## Why use these skills?

AI assistants are good at scaffolding Module Federation quickly. Without governance, they often produce **tutorial-style micro-frontends** that compile and demo well but erode team autonomy over time.

We ran a controlled experiment: two agents, same brief (React 19, Module Federation, ecommerce shell + home + catalog MFEs). One built **without** these skills; one built **with** `AGENTS.md` and `reviewing-mfe-boundaries`. The samples live outside this repo — the point is what the assistant *chooses* when skills are present.

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

The without-skills build had **critical boundary violations** (cross-imports, shared state, fat API). The with-skills build aligned with the eight rules and stayed extensible without redeploying the shell for every catalog sub-page. Details: [docs/experiment.md](docs/experiment.md).

### What you get

- **Fewer distributed-monolith traps** — agents stop “sharing utils” and global stores across team boundaries
- **Shell stays thin** — dynamic first-level routes, platform chrome only, no domain logic baked into the host
- **Reviews that mean something** — violations tied to rules, severity, and remediation — not generic React advice
- **Works across assistants** — same governance in Claude Code skills, Cursor `.mdc` rules, and Codex `AGENTS.md`

Pair the skills with your project’s `CLAUDE.md` / `AGENTS.md` (team ownership, toolchain, known exceptions) so the agent applies general rules to *your* system.

**Companion skill:** [micro-frontend-canvas](https://github.com/lucamezzalira/mfe-canvas) — Micro-Frontend Canvas worksheets and facilitation (not included in this repo).

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

See [CONTRIBUTING.md](CONTRIBUTING.md) for bump checklist.

## Experiment (before / after)

We ran two agents on the same Module Federation brief — with and without these skills. Full write-up: [docs/experiment.md](docs/experiment.md). Summary table: [Why use these skills?](#why-use-these-skills) above.

## Start Here (15 min)

If you are new to micro-frontends, this walkthrough helps you move from install to a practical first review quickly.

### 1) Pick one target flow

Choose a single user journey (for example: "add to cart and checkout") and map which shell and MFEs are involved.

### 2) Run a first architecture prompt

Use this prompt in your assistant:

```text
I am new to micro-frontends. Analyze this repository and identify:
1) business boundaries,
2) candidate MFEs,
3) anti-patterns against the 8 boundary rules.
Return findings grouped by severity and include remediation steps.
```

Expected output:
- A proposed boundary map by business capability
- A list of rule violations with severity (Critical/High/Medium)
- Concrete fixes, not only theory

### 3) Run a boundary-focused code review prompt

Use this prompt on a PR or branch diff:

```text
Review these changes with micro-frontend boundary governance:
- flag cross-MFE imports and shared state,
- check API surface size and ownership boundaries,
- verify shell-level error boundaries and fallback behavior.
Provide a go/no-go recommendation.
```

Expected output:
- Clear go/no-go recommendation
- Violations tied to specific changed files
- Suggested patch strategy for each violation

### 4) Capture local context once

Add your team-specific details in `CLAUDE.md` or `AGENTS.md`:
- Team ownership per MFE
- Current toolchain (Module Federation v1/v2, Native Federation, Single SPA)
- Known exceptions and migration milestones

This turns generic governance guidance into repo-specific decisions.

### 5) Definition of done for your first adoption

For one end-to-end flow, you should be able to confirm:
- No Rule 3 or Rule 4 violations (no cross-MFE imports, no shared store)
- Shell wraps each remote mount with an error boundary
- MFE contracts use identifiers, not domain objects
- A single team clearly owns each deployed MFE

If all four are true, you have a healthy baseline to scale.

## Updating

| Assistant | How to update |
|-----------|----------------|
| **Claude Code** | `/plugin marketplace update mfe-skills` then `/reload-plugins` |
| **Cursor / Codex / Antigravity** | Re-run install `cp` from a fresh clone or bump git submodule tag |
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
  marketplace.json                     # Claude Code marketplace catalog
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

## Publishing to marketplaces

| Platform | Hosted where? | What you need |
|----------|----------------|---------------|
| **Claude Code** | This GitHub repo | `.claude-plugin/marketplace.json` + `plugin.json`. Users: `/plugin marketplace add lucamezzalira/mfe-skills`. |
| **Cursor** | This GitHub repo | `.cursor-plugin/plugin.json` + `skills/` + generated `.cursor/rules/`. [Submit for review](https://cursor.com/marketplace/publish) when ready (MIT). |
| **Codex / Antigravity** | No central marketplace | Copy `skills/` + merge `AGENTS.md`. |

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

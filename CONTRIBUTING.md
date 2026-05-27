# Contributing to mfe-skills

Thank you for improving boundary governance for AI-assisted MFE work.

## Prerequisites

- Node.js 20+
- Edit **`skills/`** only — not generated files (unless you ran `npm run build`)

## Workflow

```bash
npm install   # no dependencies; validates node scripts only
npm run validate
npm run build
npm test
```

Open a PR. CI runs the same checks on push to `main`.

## What to edit

| Path | Purpose |
|------|---------|
| `skills/understanding-mfe-architecture/` | Adoption, boundaries, composition |
| `skills/reviewing-mfe-boundaries/` | Eight rules, review, remediation |
| `.cursor/rules/` | **Generated** — split Cursor rules |
| `AGENTS.md` | **Generated** — Codex always-on summary |

## Validation plan

`npm run validate` checks:

| Check | Severity |
|-------|----------|
| Each skill has `SKILL.md` with `name`, `description`, `license` | Error |
| No `references/canvas.md` (use `canvas-pointer.md`) | Error |
| No `check-boundary.py` references | Error |
| Internal `references/...` links resolve | Error |
| US spellings in skills (warn → prefer UK) | Warning |
| Plugin manifest version matches `package.json` | Warning |

`npm run test` (smoke) checks:

| Check | Severity |
|-------|----------|
| All expected `.cursor/rules/*.mdc` exist | Error |
| Hub files are not monolithic (>25k chars) | Error |
| `AGENTS.md` exists and stays under ~900 words | Error |
| No forbidden `check-boundary.py` in skills or rules | Error |

### Future validation (proposed)

- JSON schema for `SKILL.md` frontmatter (`name` matches folder)  
- Max size per generated `.mdc` file  
- Diff guard: PR fails if `skills/**` changed but `.cursor/rules/` not rebuilt  
- Link checker for external URLs in README  

## UK English

Use UK spelling in skills and docs: organisation, behaviour, colour, centre, recognise.

## Versioning

Bump **`package.json` version** and matching fields in:

- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json` (plugin entry)
- `.cursor-plugin/plugin.json`

Tag releases on GitHub (`v1.0.0`, `v1.1.0`, …) when publishing meaningful skill changes.

### Automated release (GitHub Actions)

**Only when `skills/` changed** — docs, CI, scripts, and generated `.cursor/rules/` do not warrant a version tag on their own. Merge those to `main`; run the workflow when you are ready to ship new skill content.

**Actions → Release (skill version bump) → Run workflow**

| Input | Meaning |
|-------|---------|
| **auto** | Infer bump from commits that **touched `skills/`** since the latest `v*` tag (`feat` → minor, `fix` → patch, `BREAKING CHANGE` / `type!:` → major) |
| **patch / minor / major** | Force that bump (still requires `skills/` changes since the last tag) |
| **dry_run** | Print analysis only; no commit or tag |
| **create_github_release** | Open a GitHub Release on the new tag |

Locally:

```bash
npm run release:bump -- --dry-run              # preview (auto)
npm run release:bump -- --bump minor --dry-run # preview (forced)
npm run release:bump -- --bump patch           # apply (then commit/tag yourself)
```

The workflow updates `package.json`, plugin manifests, SKILL `metadata.version` (major.minor), runs `npm run build`, commits, tags `vX.Y.Z`, and pushes.

Use conventional prefixes on skill commits when using **auto**, e.g. `feat(skills): add routing checklist`, `fix(skills): rule 4 platform bus wording`.

## Pull request checklist

- [ ] Changed only `skills/` (and docs/templates) unless running `npm run build`
- [ ] `npm run validate` passes
- [ ] `npm run build && npm test` passes
- [ ] Version bumped via release workflow only if `skills/` behaviour visible to users changed
- [ ] README updated if install or activation changes

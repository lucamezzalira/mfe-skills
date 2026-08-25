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

## PR titles (required before merge)

We **squash-merge** PRs, so the **PR title becomes the commit message** used by the release workflow.

CI job **PR title (conventional commits)** enforces:

| PR changes | Title must look like |
|------------|----------------------|
| Anything | Valid [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): description` |
| Files under `skills/` | `feat(skills): …`, `fix(skills): …`, `perf(skills): …`, etc. — scope **`(skills)`** required |
| `skills/` breaking | `feat(skills)!: …` or `breaking: …` |

Docs-only PRs: `docs: update README`, `chore(ci): …`, `ci: …` — no `(skills)` scope needed.

Test locally:

```bash
PR_TITLE='fix(skills): rule 4 wording' SKILLS_CHANGED=true npm run validate:pr-title
PR_TITLE='chore(ci): workflow' SKILLS_CHANGED=false npm run validate:pr-title
```

### Branch protection (repo admins)

GitHub does not run “hooks” on the client; use **branch protection** so merges are blocked until checks pass. Admins can bypass if you allow it in settings.

**Settings → Branches → Add branch ruleset** (or classic rule) for `main`:

1. **Require a pull request before merging**
2. **Require status checks to pass** — select **`PR title (conventional commits)`** (and optionally **Build distributions**)
3. **Require branches to be up to date** (recommended)
4. **Restrict who can push to matching branches** — optional; limits direct pushes to admins
5. **Allow bypassing pull request requirements** — leave **off** for everyone, or enable **only for administrators** if you want emergency merges without review

Squash merge only (recommended): **Settings → General → Pull Requests → Allow squash merging** and disable merge commits if you want one commit per PR with a clean title.

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
| `name` is 1–64 chars, lowercase `a-z0-9` with single hyphens, and matches the folder name | Error |
| `description` is non-empty and at most 1024 chars | Error |
| No `references/canvas.md` (use `canvas-pointer.md`) | Error |
| No `check-boundary.py` references | Error |
| `references/...` and cross-skill `<skill>/references/...` links resolve (inline code or markdown links, in `SKILL.md` and reference files) | Error |
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

- JSON schema for `SKILL.md` frontmatter (`metadata` value types, `compatibility` length, unknown keys)  
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
- [ ] PR title follows conventional commits (see above)
- [ ] Version bumped via release workflow only if `skills/` behaviour visible to users changed
- [ ] README updated if install or activation changes

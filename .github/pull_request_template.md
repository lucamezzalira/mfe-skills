## Summary

<!-- What changed and why -->

## Skill release?

- [ ] This PR changes files under `skills/` (will need a semver release after merge)
- [ ] Docs / CI / tooling only (no skill release required)

## PR title (required — enforced on merge)

Use [Conventional Commits](https://www.conventionalcommits.org/) in the **PR title** (squash merge uses the title as the commit message).

| If you changed… | Title pattern | Release bump (auto) |
|-----------------|---------------|---------------------|
| `skills/` only | `feat(skills): …` | minor |
| `skills/` only | `fix(skills): …` | patch |
| `skills/` breaking | `feat(skills)!: …` or `BREAKING CHANGE` in body | major |
| README, CI, scripts | `chore: …`, `docs: …`, `ci: …` | no skill release |

**Examples**

- `feat(skills): add routing ownership checklist`
- `fix(skills): rule 4 platform bus wording`
- `chore(ci): validate PR titles`

## Checklist

- [ ] PR title matches the table above
- [ ] `npm run validate` passes (if you changed skills)
- [ ] Version bump **not** in this PR — run **Release (skill version bump)** after merge when `skills/` changed

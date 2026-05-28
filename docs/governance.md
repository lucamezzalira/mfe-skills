# Governance Template (optional)

`mfe-skills` provides boundary guidance by default.  
This page describes an optional governance template for teams that want executable enforcement in CI.

## When to use

Adopt this template if you need one or more of:

- monorepo boundary drift control
- auditable exceptions with expiry
- non-binary CI policy (warn/review/fail)
- architecture fitness functions

If your team is early in adoption, start with skills only and introduce policy later.

## What is included

Template path in this repo: `governance-template/`

- `boundary-policy.yaml` — severity, CI states, merge behaviour
- `allowlist.yaml` — explicit shared-folder and package allowlist
- `exceptions.yaml` — approved, time-boxed waivers
- `fitness/ts-arch/boundaries.test.js` — starter architecture checks
- `fitness/jest.config.cjs` — test runner config

## Adopt in your project

```bash
git clone https://github.com/lucamezzalira/mfe-skills.git /tmp/mfe-skills
cp -r /tmp/mfe-skills/governance-template ./governance
```

Then:

1. Rename MFE folders in `governance/fitness/ts-arch/boundaries.test.js`
2. Update `governance/allowlist.yaml` with your approved shared areas
3. Decide CI behaviour in `governance/boundary-policy.yaml`
4. Add tooling (`jest`, `ts-arch`) to your target repo
5. Wire a `boundary-check` workflow in CI

## CI policy model

Recommended:

- `critical` -> fail (merge blocked)
- `high` -> review required (non-blocking, requires label/approval)
- `medium` / `low` -> warning only

This keeps governance strict where needed and pragmatic elsewhere.

## Notes

- `ts-arch` + `jest` is an example flavour. You can swap in dependency-cruiser, ESLint boundaries, or Nx.
- Keep the policy stable even if you change enforcement tooling.
- Exceptions should always include owner and expiry.

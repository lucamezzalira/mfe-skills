# Governance Template (optional)

Use this template when a team wants executable boundary governance on top of `mfe-skills`.

This is intentionally opt-in. The skills work without this folder.

## What this template gives you

- Policy file with severity and CI behaviour
- Shared-area allowlist model (no wild-west shared folder)
- Exceptions file with owner and expiry
- `ts-arch` + `jest` starter test for import boundaries

## Intended location in product repos

Copy into the target repository root as `governance/`:

```bash
cp -r /tmp/mfe-skills/governance-template ./governance
```

Then adapt paths, labels, and severity thresholds to your organisation.

## Suggested adoption path

1. Start with warnings only (`medium` / `low`)
2. Block only `critical` violations
3. Add review gate for `high` violations
4. Time-box exceptions in `exceptions.yaml`

## Tooling notes

`ts-arch` + `jest` is one flavour. Equivalent checks can be implemented with:

- dependency-cruiser
- eslint boundaries plugins
- Nx module boundary rules

The policy should stay stable even if enforcement tooling changes.

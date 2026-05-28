# GitHub Copilot repository instructions

Use this file as the Copilot-native entry point for MFE governance.

## Canonical source

- `AGENTS.md` is the canonical cross-agent governance baseline in this repository.
- This file mirrors the highest-value instructions for Copilot and points to `AGENTS.md` for full context.

## Boundary governance defaults

When reviewing or generating micro-frontend code:

1. Apply the eight MFE boundary rules from `AGENTS.md`.
2. Prioritise Critical violations first (cross-MFE imports, shared state across boundaries).
3. Keep shell responsibilities thin: first route segment, platform chrome, fallbacks.
4. Keep MFE contracts minimal: identifiers only, not full domain objects.
5. Prefer runtime remote discovery over version-pinned shell remotes.

## Additional governance extensions

- Feature flags for behaviour belong inside owning MFEs.
- Edge compute should be justified (canary, strangler, traffic steering).
- SSR ownership should stay route/domain based with clear team accountability.
- Use architecture fitness functions in monorepos to enforce boundaries continuously.

## Response style for Copilot reviews

- Cite rule numbers when flagging violations.
- Return findings by severity order: Critical, High, Medium.
- Include concise remediation steps for each violation.

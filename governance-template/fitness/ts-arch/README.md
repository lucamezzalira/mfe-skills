# ts-arch + jest fitness function starter

This folder contains a starter architecture test to enforce:

- no direct imports from one MFE into another MFE
- explicit allowlist for shared imports

## Install in your target repo

```bash
pnpm add -D jest ts-arch
```

## Run

```bash
pnpm jest -c governance/fitness/jest.config.cjs
```

## Adapt

- Update MFE names in `boundaries.test.js`
- Update allowed shared paths in `allowlist.yaml`
- Wire this command into CI with your severity policy

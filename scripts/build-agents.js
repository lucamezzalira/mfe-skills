#!/usr/bin/env node
/**
 * Generates root AGENTS.md for Codex and other always-on agent context.
 */

'use strict'

const fs = require('fs')
const path = require('path')

const OUT_PATH = path.join(__dirname, '..', 'AGENTS.md')
const VERSION = require('../package.json').version

const content = `# MFE Boundary Governance

Micro-frontend architecture skills by Luca Mezzalira (mfe-skills v${VERSION}).
Full reference: https://github.com/lucamezzalira/mfe-skills

Apply these rules when reviewing or generating code that crosses a team deployment boundary:
shell mounting, cross-MFE communication, remote loading, or contract design.

**Essential:** Pair this file with project-specific facts in the same \`AGENTS.md\` (which team owns which MFE, toolchain, \`routes.json\` location, known exceptions). Without that context, advice stays generic.

## Boundary health check

Before generating MFE code, verify:

1. Is the API surface minimal, fewer than 5 props to the container?
2. Is the MFE context-aware, does it retrieve its own data given minimal input?
3. Is it less extensible than a component, not designed for reuse across domains?
4. Is it coarse-grained, not fine enough to require constant coordination?
5. Can it deploy without coordinating with other teams?
6. Does it have a graceful fallback if it fails to load?
7. Does a single team own it end-to-end?

If any answer is no, the boundary needs to be revisited before implementation.

## The eight boundary rules

| Rule | Principle | Violation signals |
|------|-----------|-------------------|
| 1 - Business subdomain | One MFE = one business capability owned by one team | Named after UI elements (Header, Sidebar), used across unrelated domains |
| 2 - Minimal API surface | Max ~5 props, identifiers only, no domain objects | Props like \`user\`, \`cart\`, \`order\`; shell fetching data for the MFE |
| 3 - Hides implementation | No cross-MFE imports; each MFE owns its data layer | \`import { x } from '@org/other-mfe/...'\`; path aliases masking cross-boundary imports |
| 4 - Events not shared state | Platform bus to shell; domain events peer-to-peer only; no shared stores | Shared Redux/Zustand; \`window.__mfe_*\`; shell listening to \`catalog:*\` / \`checkout:*\` |
| 5 - Independent deployment | No versioned remote URLs; no CI coupling | \`remotes: { checkout: '...@/v3.2.1/remoteEntry.js' }\`; CI \`needs:\` across MFE pipelines |
| 6 - Isolates failure | ErrorBoundary in shell at every mount; fallbacks in shell | No boundary; fallback only inside MFE; unhandled \`loadRemoteModule\` rejection |
| 7 - Coarse-grained | Shell first URL segment via manifest; MFE owns sub-routes | Shell routes like \`/catalog/product/:id\`; shell domain event handlers |
| 8 - Single team ownership | One team in CODEOWNERS per MFE | Multiple teams per MFE; no deployment owner |

## Severity levels

- **Critical** (Rules 3, 4): Cross-boundary imports, shared state, shell domain event handlers.
- **High** (Rules 2, 5, 6): API surface, deployment coupling, missing error boundaries.
- **Medium** (Rules 1, 7, 8): Domain alignment, granularity, ownership.

## Code generation defaults

- Props: identifiers only (\`userId\`, \`cartId\`), never domain objects
- Error handling: ErrorBoundary in the shell wrapping every remote mount
- Routing: shell loads only the first path segment from \`routes.json\`; MFE owns deeper paths
- Shell platform events: \`shell:alert\`, \`shell:modal:*\` — never \`catalog:*\`, \`checkout:*\` in the shell
- Cross-area navigation: URL (change first segment); MFE-to-MFE domain events only on the same page (horizontal split)
- No shared stores across boundaries; use URL, storage, or peer events
- Loading: runtime remote URLs, never version-pinned remotes in the shell build
- Auth: sessionStorage or fetch wrapper, never cross-MFE auth imports

## Skills and Canvas

- Architecture and adoption: \`understanding-mfe-architecture\` skill
- Code review and shell generation: \`reviewing-mfe-boundaries\` skill
- Canvas facilitation: separate [micro-frontend-canvas](https://github.com/lucamezzalira/mfe-canvas) skill

Install: https://github.com/lucamezzalira/mfe-skills
`

fs.writeFileSync(OUT_PATH, content, 'utf8')

const words = content.split(/\s+/).length
console.log(`AGENTS.md: ${words} words, ${content.length} chars`)

if (words > 800) {
  console.warn(`  Warning: keep AGENTS.md under ~800 words for always-on context.`)
}

#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
let failed = 0

function ok(msg) {
  console.log(`  ✓ ${msg}`)
}

function fail(msg) {
  console.error(`  ✗ ${msg}`)
  failed++
}

const rulesDir = path.join(root, '.cursor', 'rules')
const expectedMdc = [
  'mfe-architecture.mdc',
  'mfe-architecture-boundary-design.mdc',
  'mfe-architecture-decisions.mdc',
  'mfe-architecture-rules-ref.mdc',
  'mfe-architecture-canvas-pointer.mdc',
  'mfe-boundary-review.mdc',
  'mfe-boundary-rules-core.mdc',
  'mfe-boundary-toolchain.mdc',
  'mfe-boundary-routing.mdc',
  'mfe-boundary-remediation.mdc',
]

console.log('smoke-test')

if (!fs.existsSync(rulesDir)) {
  fail('.cursor/rules/ missing — run npm run build')
} else {
  for (const file of expectedMdc) {
    const p = path.join(rulesDir, file)
    if (!fs.existsSync(p)) fail(`missing ${file}`)
    else {
      const size = fs.statSync(p).size
      if (size < 200) fail(`${file} too small (${size} bytes)`)
      else ok(`${file} (${size} bytes)`)
    }
  }

  const hub = fs.readFileSync(path.join(rulesDir, 'mfe-boundary-review.mdc'), 'utf8')
  if (hub.length > 25000) fail(`mfe-boundary-review.mdc still monolithic (${hub.length} chars)`)
  else ok(`hub size OK (${hub.length} chars)`)
}

const agentsPath = path.join(root, 'AGENTS.md')
if (!fs.existsSync(agentsPath)) fail('AGENTS.md missing — run npm run build')
else {
  const words = fs.readFileSync(agentsPath, 'utf8').split(/\s+/).length
  if (words > 900) fail(`AGENTS.md too long (${words} words)`)
  else ok(`AGENTS.md (${words} words)`)
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}

console.log('\nAll smoke checks passed')

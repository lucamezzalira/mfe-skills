#!/usr/bin/env node
'use strict'

const { validatePullRequestTitle } = require('./conventional-commit')

const title = process.env.PR_TITLE || process.argv[2]
const skillsChanged =
  process.env.SKILLS_CHANGED === 'true' || process.env.SKILLS_CHANGED === '1'

if (!title) {
  console.error('PR_TITLE env var or argv[2] required')
  process.exit(1)
}

const result = validatePullRequestTitle(title, { skillsChanged })

console.log(`PR title: ${title}`)
console.log(`skills/ changed: ${skillsChanged}`)

if (result.hints.length) {
  for (const h of result.hints) console.log(`  hint: ${h}`)
}

if (!result.ok) {
  for (const e of result.errors) console.error(`  error: ${e}`)
  process.exit(1)
}

console.log('  ok: PR title is valid')

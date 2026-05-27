#!/usr/bin/env node
/**
 * Contributor validation — run before opening a PR.
 */

'use strict'

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const skillsDir = path.join(root, 'skills')
let errors = 0
let warnings = 0

function error(msg) {
  console.error(`  ERROR: ${msg}`)
  errors++
}

function warn(msg) {
  console.warn(`  WARN: ${msg}`)
  warnings++
}

function ok(msg) {
  console.log(`  ok: ${msg}`)
}

const US_UK = [
  [/\borganiz(e|es|ed|ing|ation)\b/gi, 'organise/organisation'],
  [/\bbehavior\b/gi, 'behaviour'],
  [/\bcolor\b/gi, 'colour'],
  [/\bcenter\b/gi, 'centre'],
  [/\brecognize\b/gi, 'recognise'],
]

console.log('validate\n--- skills ---')

for (const skillName of fs.readdirSync(skillsDir)) {
  const skillDir = path.join(skillsDir, skillName)
  if (!fs.statSync(skillDir).isDirectory()) continue

  const skillMd = path.join(skillDir, 'SKILL.md')
  if (!fs.existsSync(skillMd)) {
    error(`${skillName}: missing SKILL.md`)
    continue
  }

  const raw = fs.readFileSync(skillMd, 'utf8')
  if (!raw.startsWith('---')) error(`${skillName}: SKILL.md missing YAML frontmatter`)

  for (const field of ['name', 'description', 'license']) {
    if (!new RegExp(`^${field}:`, 'm').test(raw)) error(`${skillName}: missing frontmatter ${field}`)
  }

  if (raw.includes('references/canvas.md')) {
    error(`${skillName}: references canvas.md — use canvas-pointer.md`)
  }

  const refsDir = path.join(skillDir, 'references')
  if (fs.existsSync(refsDir)) {
    for (const file of fs.readdirSync(refsDir)) {
      if (!file.endsWith('.md')) continue
      const refPath = path.join(refsDir, file)
      const body = fs.readFileSync(refPath, 'utf8')
      if (body.includes('check-boundary.py')) error(`${skillName}/${file}: remove check-boundary.py reference`)

      for (const [pattern, suggestion] of US_UK) {
        if (pattern.test(body)) warn(`${skillName}/${file}: possible US spelling — prefer ${suggestion}`)
        pattern.lastIndex = 0
      }

      const refs = [...body.matchAll(/`references\/([^`]+)`/g)].map((m) => m[1])
      for (const ref of refs) {
        if (!fs.existsSync(path.join(refsDir, ref))) {
          error(`${skillName}/${file}: broken reference references/${ref}`)
        }
      }
    }
  }

  ok(skillName)
}

console.log('\n--- repo ---')

if (fs.existsSync(path.join(skillsDir, 'understanding-mfe-architecture/references/canvas.md'))) {
  error('canvas.md still present — use canvas-pointer.md only')
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const pluginPaths = [
  '.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
  '.cursor-plugin/plugin.json',
]

for (const rel of pluginPaths) {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) error(`missing ${rel}`)
  else {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'))
    const v = j.version ?? j.plugins?.[0]?.version
    if (v && v !== pkg.version) warn(`${rel} version ${v} !== package.json ${pkg.version}`)
  }
}

if (!fs.existsSync(path.join(root, 'templates/AGENTS.project-snippet.md'))) {
  warn('templates/AGENTS.project-snippet.md missing')
}

console.log(`\n${errors} error(s), ${warnings} warning(s)`)
if (errors > 0) process.exit(1)

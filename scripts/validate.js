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

/** Parse the YAML frontmatter block into { field: value }. Handles quoted scalars and `>` / `|` block scalars. */
function parseFrontmatter(raw) {
  const block = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  if (block === undefined) return {}
  const fields = {}
  const lines = block.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!m) continue
    let [, key, value] = m
    if (/^[>|][-+]?$/.test(value)) {
      const parts = []
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) parts.push(lines[++i].trim())
      value = parts.join(' ')
    }
    fields[key] = value.replace(/^(["'])(.*)\1$/, '$2')
  }
  return fields
}

/**
 * Check that `references/x.md` and `<skill>/references/x.md` links resolve, whether written
 * as inline code or as markdown link targets. `#anchors` are ignored; globs (`*`) are skipped.
 */
function checkReferences(skillName, file, body, skillDir) {
  const pattern = /(?:`|\]\()(?:([a-z0-9-]+)\/)?references\/([^`)#*]+?)(?:#[^`)]*)?[`)]/g
  for (const [, otherSkill, ref] of body.matchAll(pattern)) {
    const base = otherSkill ? path.join(skillsDir, otherSkill) : skillDir
    if (!fs.existsSync(path.join(base, 'references', ref))) {
      error(`${skillName}/${file}: broken reference ${otherSkill ? otherSkill + '/' : ''}references/${ref}`)
    }
  }
}

for (const skillName of fs.readdirSync(skillsDir)) {
  const skillDir = path.join(skillsDir, skillName)
  if (!fs.statSync(skillDir).isDirectory()) continue

  const skillMd = path.join(skillDir, 'SKILL.md')
  if (!fs.existsSync(skillMd)) {
    error(`${skillName}: missing SKILL.md`)
    continue
  }

  const raw = fs.readFileSync(skillMd, 'utf8').replace(/^\uFEFF/, '')
  if (!raw.startsWith('---')) error(`${skillName}: SKILL.md missing YAML frontmatter`)

  const fm = parseFrontmatter(raw)
  for (const field of ['name', 'description', 'license']) {
    if (!(field in fm)) error(`${skillName}: missing frontmatter ${field}`)
  }

  // Agent Skills spec: name is 1-64 chars, lowercase a-z0-9 with single hyphens, and matches the folder
  const { name, description } = fm
  if (name !== undefined) {
    if (name.length > 64 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
      error(`${skillName}: name "${name}" must be 1-64 chars, lowercase a-z0-9 with single hyphens`)
    }
    if (name !== skillName) error(`${skillName}: frontmatter name "${name}" does not match folder name`)
  }

  // Agent Skills spec: description is non-empty and at most 1024 chars
  if (description !== undefined) {
    if (description.length === 0) error(`${skillName}: description must be non-empty`)
    else if (description.length > 1024) error(`${skillName}: description is ${description.length} chars (max 1024)`)
  }

  checkReferences(skillName, 'SKILL.md', raw, skillDir)

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

      checkReferences(skillName, file, body, skillDir)
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

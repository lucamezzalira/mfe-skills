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
    // Anthropic reserved words + open-spec consecutive hyphens
    if (/anthropic|claude/i.test(name)) {
      error(`${skillName}: name must not contain reserved substring "anthropic" or "claude"`)
    }
    if (name.includes('--')) {
      error(`${skillName}: name must not contain consecutive hyphens (--)` )
    }
  }

  // Agent Skills spec: description is non-empty and at most 1024 chars
  if (description !== undefined) {
    if (description.length === 0) error(`${skillName}: description must be non-empty`)
    else if (description.length > 1024) error(`${skillName}: description is ${description.length} chars (max 1024)`)
  }

  const bodyMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/)
  const body = bodyMatch ? bodyMatch[1] : raw
  const bodyLines = body.split(/\r?\n/).length
  if (bodyLines > 500) {
    error(`${skillName}: SKILL.md body is ${bodyLines} lines (max 500)`)
  } else if (bodyLines > 400) {
    warn(`${skillName}: SKILL.md body is ${bodyLines} lines (warn at 400, fail at 500)`)
  }

  checkBackslashPaths(skillName, 'SKILL.md', raw)
  checkReferences(skillName, 'SKILL.md', raw, skillDir)

  if (raw.includes('references/canvas.md')) {
    error(`${skillName}: references canvas.md — use canvas-pointer.md`)
  }

  const refsDir = path.join(skillDir, 'references')
  if (fs.existsSync(refsDir)) {
    for (const file of fs.readdirSync(refsDir)) {
      if (!file.endsWith('.md')) continue
      const refPath = path.join(refsDir, file)
      const refBody = fs.readFileSync(refPath, 'utf8')
      const refLines = refBody.split(/\r?\n/).length
      if (refLines > 500) {
        error(`${skillName}/${file}: reference is ${refLines} lines (max 500)`)
      }
      if (refLines > 100) {
        const head = refBody.split(/\r?\n/).slice(0, 20).join('\n')
        if (!/^## Contents\b/m.test(head)) {
          error(
            `${skillName}/${file}: reference over 100 lines must have "## Contents" within the first 20 lines`,
          )
        }
      }
      if (refBody.includes('check-boundary.py')) error(`${skillName}/${file}: remove check-boundary.py reference`)

      for (const [pattern, suggestion] of US_UK) {
        if (pattern.test(refBody)) warn(`${skillName}/${file}: possible US spelling — prefer ${suggestion}`)
        pattern.lastIndex = 0
      }

      checkBackslashPaths(skillName, file, refBody)
      checkReferences(skillName, file, refBody, skillDir)
    }
  }

  ok(skillName)
}

/** Flag Windows-style paths in code fences and inline code (Anthropic anti-pattern). */
function checkBackslashPaths(skillName, file, text) {
  const fence = /```[\s\S]*?```/g
  for (const block of text.matchAll(fence)) {
    if (/[A-Za-z]:\\|(?:^|[\s"`'])(?:\.\.\\|\\users\\|\\src\\)/i.test(block[0])) {
      error(`${skillName}/${file}: backslash path in code block — use forward slashes`)
    }
  }
  const inline = /`([^`]+)`/g
  for (const m of text.matchAll(inline)) {
    const s = m[1]
    if (/\\/.test(s) && /\.(md|js|ts|tsx|jsx|json|cjs|mjs|yml|yaml)\b/i.test(s)) {
      error(`${skillName}/${file}: backslash in path \`${s}\` — use forward slashes`)
    }
  }
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

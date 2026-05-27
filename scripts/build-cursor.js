#!/usr/bin/env node
/**
 * Generates split .mdc rule files for Cursor from skills/.
 * Output: .cursor/rules/*.mdc (one hub per skill + one file per reference).
 */

'use strict'

const fs = require('fs')
const path = require('path')

const SKILLS_DIR = path.join(__dirname, '..', 'skills')
const OUT_DIR = path.join(__dirname, '..', '.cursor', 'rules')

/** Skill folder → hub .mdc basename (SKILL body only, routes to references) */
const HUB_NAMES = {
  'understanding-mfe-architecture': 'mfe-architecture',
  'reviewing-mfe-boundaries': 'mfe-boundary-review',
}

/** reference filename → .mdc basename */
const REF_NAMES = {
  'understanding-mfe-architecture': {
    'boundary-design.md': 'mfe-architecture-boundary-design',
    'decisions-framework.md': 'mfe-architecture-decisions',
    'rules.md': 'mfe-architecture-rules-ref',
    'canvas-pointer.md': 'mfe-architecture-canvas-pointer',
  },
  'reviewing-mfe-boundaries': {
    'rules-core.md': 'mfe-boundary-rules-core',
    'rules-toolchain.md': 'mfe-boundary-toolchain',
    'routing-ownership.md': 'mfe-boundary-routing',
    'remediation.md': 'mfe-boundary-remediation',
  },
}

function parseFrontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: md.trim() }
  const meta = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
  }
  return { meta, body: match[2].trim() }
}

function refDescription(skillName, filename, content) {
  const heading = content.match(/^#\s+(.+)$/m)
  const title = heading ? heading[1] : filename.replace('.md', '')
  const skillLabel =
    skillName === 'understanding-mfe-architecture'
      ? 'Micro-frontend architecture'
      : 'MFE boundary review'
  return `${skillLabel}: ${title}. Load when this topic is in scope; part of mfe-skills.`
}

function writeMdc(outPath, description, body) {
  const safeDesc = description.replace(/\n/g, ' ').trim()
  const mdc = `---\ndescription: ${safeDesc}\nalwaysApply: false\n---\n\n${body}\n`
  fs.writeFileSync(outPath, mdc, 'utf8')
  return mdc.length
}

function cleanOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (file.endsWith('.mdc')) fs.unlinkSync(path.join(OUT_DIR, file))
  }
}

cleanOutDir()

let totalChars = 0

for (const skillName of fs.readdirSync(SKILLS_DIR).sort()) {
  const skillDir = path.join(SKILLS_DIR, skillName)
  if (!fs.statSync(skillDir).isDirectory()) continue

  const skillMdPath = path.join(skillDir, 'SKILL.md')
  if (!fs.existsSync(skillMdPath)) continue

  const { meta, body } = parseFrontmatter(fs.readFileSync(skillMdPath, 'utf8'))
  const hubDesc = meta.description || skillName
  const hubBase = HUB_NAMES[skillName] ?? skillName

  totalChars += writeMdc(
    path.join(OUT_DIR, `${hubBase}.mdc`),
    hubDesc,
    `${body}\n\n_Reference detail is split into separate rules in \`.cursor/rules/\` — load on demand._\n`,
  )
  console.log(`  ${hubBase}.mdc (hub)`)

  const refsDir = path.join(skillDir, 'references')
  if (!fs.existsSync(refsDir)) continue

  const refMap = REF_NAMES[skillName] ?? {}

  for (const file of fs.readdirSync(refsDir).sort()) {
    if (!file.endsWith('.md') || file === 'CHANGELOG.md') continue
    const content = fs.readFileSync(path.join(refsDir, file), 'utf8')
    const base = refMap[file] ?? `${hubBase}-${file.replace('.md', '')}`
    const desc = refDescription(skillName, file, content)
    const size = writeMdc(path.join(OUT_DIR, `${base}.mdc`), desc, content)
    totalChars += size
    console.log(`  ${base}.mdc (${size} chars)`)
  }
}

console.log(`Built ${fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.mdc')).length} files → .cursor/rules/ (${totalChars} chars total)`)

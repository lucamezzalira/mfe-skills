#!/usr/bin/env node
/**
 * Semver bump for a skill release — only commits that touch skills/ since the latest v* tag.
 *
 * Usage:
 *   node scripts/bump-version.js [--bump auto|patch|minor|major] [--dry-run] [--json]
 *
 * Writes GITHUB_OUTPUT keys when GITHUB_OUTPUT is set (release workflow).
 */

'use strict'

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.join(__dirname, '..')

function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { bump: 'auto', dryRun: false, json: false }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--bump' && args[i + 1]) opts.bump = args[++i]
    else if (args[i] === '--dry-run') opts.dryRun = true
    else if (args[i] === '--json') opts.json = true
  }
  if (!['auto', 'patch', 'minor', 'major'].includes(opts.bump)) {
    console.error(`Invalid --bump ${opts.bump}`)
    process.exit(1)
  }
  return opts
}

function sh(cmd) {
  return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim()
}

function parseSemver(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.exec(v)
  if (!m) throw new Error(`Invalid semver: ${v}`)
  return { major: +m[1], minor: +m[2], patch: +m[3] }
}

function formatSemver({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`
}

function bumpSemver(current, level) {
  const v = parseSemver(current)
  if (level === 'major') return formatSemver({ major: v.major + 1, minor: 0, patch: 0 })
  if (level === 'minor') return formatSemver({ major: v.major, minor: v.minor + 1, patch: 0 })
  if (level === 'patch') return formatSemver({ major: v.major, minor: v.minor, patch: v.patch + 1 })
  throw new Error(`Unknown level ${level}`)
}

function latestTag() {
  try {
    const t = execSync('git describe --tags --abbrev=0 --match "v*"', {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return t.startsWith('v') ? t : `v${t}`
  } catch {
    return null
  }
}

const SKILLS_PATHSPEC = 'skills/'

function commitsSince(tag) {
  const range = tag ? `${tag}..HEAD` : 'HEAD'
  const out = execSync(
    `git log ${range} --pretty=format:%s%n%b%n----COMMIT---- -- ${SKILLS_PATHSPEC}`,
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
  ).trim()
  if (!out) return []
  return out
    .split('\n----COMMIT----\n')
    .filter(Boolean)
    .map((block) => {
      const lines = block.trim().split('\n')
      const subject = lines[0] || ''
      const body = lines.slice(1).join('\n')
      return { subject, body }
    })
}

function skillFilesChangedSince(tag) {
  const range = tag ? `${tag}..HEAD` : 'HEAD'
  const out = execSync(`git diff --name-only ${range} -- ${SKILLS_PATHSPEC}`, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
  return out ? out.split('\n').filter(Boolean) : []
}

const BUMP_RANK = { none: 0, patch: 1, minor: 2, major: 3 }

function classifyCommit({ subject, body }) {
  const text = `${subject}\n${body}`
  const firstLine = subject.trim()

  if (/BREAKING CHANGE/i.test(text) || /^break(ing)?:/i.test(firstLine)) {
    return { level: 'major', reason: 'breaking change' }
  }

  const conv = /^(\w+)(?:\([^)]+\))?!:\s/.exec(firstLine)
  if (conv) return { level: 'major', reason: `${conv[1]}! (breaking)` }

  const convPlain = /^(\w+)(?:\([^)]+\))?:\s/.exec(firstLine)
  const type = convPlain ? convPlain[1].toLowerCase() : null

  if (type === 'feat' || type === 'feature') return { level: 'minor', reason: 'feat' }
  if (['fix', 'perf', 'revert', 'refactor', 'security'].includes(type)) {
    return { level: 'patch', reason: type }
  }
  if (['docs', 'chore', 'style', 'test', 'ci', 'build', 'deps'].includes(type)) {
    return { level: 'none', reason: type }
  }

  // Merge commits / free-form: conservative patch if it looks like a fix
  if (/^(fix|hotfix|bug)\b/i.test(firstLine)) return { level: 'patch', reason: 'heuristic fix' }
  if (/^(feat|feature|add)\b/i.test(firstLine)) return { level: 'minor', reason: 'heuristic feat' }
  if (/\bbreaking\b/i.test(firstLine)) return { level: 'major', reason: 'heuristic breaking' }

  return { level: 'none', reason: 'unclassified' }
}

function analyzeCommits(commits) {
  const details = []
  let suggested = 'none'

  for (const c of commits) {
    const { level, reason } = classifyCommit(c)
    details.push({ subject: c.subject, level, reason })
    if (BUMP_RANK[level] > BUMP_RANK[suggested]) suggested = level
  }

  return { suggested, details }
}

function readPackageVersion() {
  return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version
}

function writePackageVersion(version) {
  const pkgPath = path.join(root, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkg.version = version
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
}

function writePluginManifests(version) {
  const claude = path.join(root, '.claude-plugin/plugin.json')
  const cursor = path.join(root, '.cursor-plugin/plugin.json')
  const market = path.join(root, '.claude-plugin/marketplace.json')

  for (const p of [claude, cursor]) {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'))
    j.version = version
    fs.writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`)
  }

  const m = JSON.parse(fs.readFileSync(market, 'utf8'))
  if (m.plugins?.[0]) m.plugins[0].version = version
  fs.writeFileSync(market, `${JSON.stringify(m, null, 2)}\n`)
}

function writeSkillMetadata(version) {
  const { major, minor } = parseSemver(version)
  const skillVersion = `${major}.${minor}`
  const skillDirs = [
    'skills/understanding-mfe-architecture/SKILL.md',
    'skills/reviewing-mfe-boundaries/SKILL.md',
  ]
  for (const rel of skillDirs) {
    const p = path.join(root, rel)
    let text = fs.readFileSync(p, 'utf8')
    if (/^\s*version:\s*["']?[\d.]+["']?\s*$/m.test(text)) {
      text = text.replace(/^(\s*version:\s*)["']?[\d.]+["']?\s*$/m, `$1"${skillVersion}"`)
    }
    fs.writeFileSync(p, text)
  }
}

function setGithubOutput(key, value) {
  const file = process.env.GITHUB_OUTPUT
  if (!file) return
  fs.appendFileSync(file, `${key}=${value}\n`)
}

function main() {
  const opts = parseArgs()
  const current = readPackageVersion()
  const tag = latestTag()
  const skillFiles = skillFilesChangedSince(tag)
  const commits = commitsSince(tag)

  if (skillFiles.length === 0) {
    console.error(
      tag
        ? `No changes under ${SKILLS_PATHSPEC} since ${tag}. Release only when skill content changes.`
        : `No changes under ${SKILLS_PATHSPEC}. Nothing to release.`,
    )
    process.exit(1)
  }

  if (commits.length === 0) {
    console.error(`Files under ${SKILLS_PATHSPEC} changed but no commits touch that path (unusual).`)
    process.exit(1)
  }

  const { suggested, details } = analyzeCommits(commits)
  let level = opts.bump === 'auto' ? suggested : opts.bump

  if (opts.bump === 'auto' && level === 'none') {
    console.error(
      'Skill commits since last tag have no feat/fix/breaking conventional prefix.',
    )
    console.error('Use --bump patch|minor|major if the skill change still warrants a release.')
    process.exit(1)
  }

  const next = bumpSemver(current, level)
  const tagName = `v${next}`

  const report = {
    current,
    next,
    level,
    tag: tagName,
    sinceTag: tag,
    commitCount: commits.length,
    skillFiles,
    suggested: opts.bump === 'auto' ? suggested : null,
    commits: details,
    dryRun: opts.dryRun,
  }

  if (opts.json) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log('Skill release bump')
    console.log(`  Since tag:     ${tag ?? '(none — all history)'}`)
    console.log(`  Skill files:   ${skillFiles.length} changed under ${SKILLS_PATHSPEC}`)
    console.log(`  Commits:       ${commits.length} (touching ${SKILLS_PATHSPEC} only)`)
    console.log(`  Suggested:     ${opts.bump === 'auto' ? suggested : '(manual)'}`)
    console.log(`  Bump level:    ${level}`)
    console.log(`  ${current} → ${next}`)
    console.log(`  Tag:           ${tagName}`)
    if (details.length) {
      console.log('\n  Commit analysis:')
      for (const d of details) {
        const icon = d.level === 'none' ? '·' : d.level === 'major' ? '!' : d.level === 'minor' ? '+' : '~'
        console.log(`    [${icon}] ${d.level.padEnd(5)} ${d.subject.slice(0, 72)}`)
      }
    }
  }

  setGithubOutput('current_version', current)
  setGithubOutput('new_version', next)
  setGithubOutput('bump_level', level)
  setGithubOutput('tag_name', tagName)
  setGithubOutput('should_release', 'true')

  if (opts.dryRun) {
    console.log('\n(dry-run — no files changed)')
    return
  }

  writePackageVersion(next)
  writePluginManifests(next)
  writeSkillMetadata(next)
  execSync('node scripts/build-agents.js', { cwd: root, stdio: 'inherit' })
  console.log('\nUpdated package.json, plugin manifests, SKILL metadata, AGENTS.md')
}

main()

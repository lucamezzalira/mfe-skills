#!/usr/bin/env node
'use strict'

/** @typedef {{ type: string, scope: string | null, breaking: boolean, description: string }} ParsedSubject */

const ALL_TYPES = [
  'feat',
  'fix',
  'docs',
  'chore',
  'ci',
  'build',
  'test',
  'style',
  'perf',
  'revert',
  'refactor',
  'security',
  'deps',
]

/** Types that drive semver when skills/ change */
const SKILL_RELEASE_TYPES = ['feat', 'fix', 'perf', 'refactor', 'revert', 'security']

const SUBJECT_RE = /^(\w+)(?:\(([^)]+)\))?(!)?:\s+(.+)$/

/**
 * @param {string} subject
 * @returns {ParsedSubject | null}
 */
function parseConventionalSubject(subject) {
  const line = subject.trim()
  if (/^break(ing)?:\s+/i.test(line)) {
    const description = line.replace(/^break(ing)?:\s+/i, '')
    return { type: 'breaking', scope: null, breaking: true, description }
  }

  const m = SUBJECT_RE.exec(line)
  if (!m) return null

  const type = m[1].toLowerCase()
  if (!ALL_TYPES.includes(type) && type !== 'feature') return null

  const description = m[4].trim()
  if (description.length < 3) return null

  return {
    type: type === 'feature' ? 'feat' : type,
    scope: m[2] ? m[2].toLowerCase() : null,
    breaking: Boolean(m[3]),
    description,
  }
}

/**
 * @param {string} subject
 * @returns {'major' | 'minor' | 'patch' | 'none'}
 */
function classifySubject(subject) {
  const parsed = parseConventionalSubject(subject)
  if (!parsed) return 'none'

  if (parsed.breaking || parsed.type === 'breaking') return 'major'
  if (parsed.type === 'feat') return 'minor'
  if (SKILL_RELEASE_TYPES.includes(parsed.type)) return 'patch'
  return 'none'
}

/**
 * @param {string} title
 * @param {{ skillsChanged: boolean }} opts
 * @returns {{ ok: boolean, errors: string[], hints: string[] }}
 */
function validatePullRequestTitle(title, { skillsChanged }) {
  const errors = []
  const hints = []
  const parsed = parseConventionalSubject(title)

  if (!parsed) {
    errors.push('PR title must follow Conventional Commits: type(scope): description')
    hints.push('Examples: chore(ci): fix release workflow, feat(skills): add rule 4 examples')
    hints.push('https://www.conventionalcommits.org/')
    return { ok: false, errors, hints }
  }

  if (skillsChanged) {
    if (!SKILL_RELEASE_TYPES.includes(parsed.type) && !parsed.breaking && parsed.type !== 'breaking') {
      errors.push(
        `PR changes skills/ — use feat, fix, perf, refactor, revert, security, or a breaking type (not ${parsed.type})`,
      )
    }
    if (parsed.scope !== 'skills') {
      errors.push('PR changes skills/ — scope must be (skills), e.g. fix(skills): clarify platform bus')
    }
    if (parsed.type === 'feat' || parsed.type === 'fix') {
      hints.push(`This title will suggest a ${parsed.type === 'feat' ? 'minor' : 'patch'} bump on release (auto)`)
    }
    if (parsed.breaking) hints.push('Breaking title → major bump on release (auto)')
  } else if (!ALL_TYPES.includes(parsed.type)) {
    errors.push(`Unknown type "${parsed.type}"`)
  }

  return { ok: errors.length === 0, errors, hints }
}

module.exports = {
  ALL_TYPES,
  SKILL_RELEASE_TYPES,
  parseConventionalSubject,
  classifySubject,
  validatePullRequestTitle,
}

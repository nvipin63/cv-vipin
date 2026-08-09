import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const portfolio = require('../src/data/portfolio.json')

const injectionPatterns = [
  /ignore (all|any|the|your) (previous|prior|system|developer) instructions/i,
  /reveal (the )?(system|developer|hidden) prompt/i,
  /show (me )?(your )?(rules|instructions|prompt)/i,
  /act as (an?|the) (unrestricted|different|new)/i,
  /jailbreak|prompt injection|developer message/i,
]

const stopWords = new Set([
  'a',
  'about',
  'after',
  'also',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'can',
  'did',
  'do',
  'does',
  'for',
  'from',
  'has',
  'have',
  'he',
  'him',
  'his',
  'how',
  'i',
  'in',
  'into',
  'is',
  'it',
  'me',
  'of',
  'on',
  'the',
  'to',
  'vipin',
  'was',
  'what',
  'which',
  'why',
  'with',
])

const termExpansions = {
  ai: ['agentic', 'genai', 'llm'],
  architect: ['architecture', 'orchestrator'],
  background: ['profile', 'career', 'experience'],
  bio: ['profile', 'career', 'experience'],
  built: ['developed', 'created', 'delivered', 'project'],
  cloud: ['azure', 'gcp'],
  companies: ['career', 'employers', 'experience'],
  company: ['career', 'employer', 'experience'],
  decision: ['decisions', 'tradeoffs', 'approach'],
  employer: ['career', 'companies', 'experience'],
  expertise: ['skills', 'capabilities', 'experience'],
  framework: ['langchain', 'langgraph', 'deepagents', 'adk'],
  history: ['career', 'experience', 'progression'],
  journey: ['career', 'experience', 'progression'],
  quality: ['fmea', 'nonconformity', 'validation'],
  report: ['reporting', 'hyperview', 'slides'],
  responsibility: ['ownership', 'role'],
  role: ['ownership', 'responsibilities'],
  skill: ['capabilities', 'expertise', 'technology'],
  suitable: ['profile', 'skills', 'experience', 'projects'],
  tool: ['technology', 'frameworks', 'stack'],
  tradeoff: ['decisions', 'approach'],
}

function stem(token) {
  if (token.length > 5 && token.endsWith('ies')) return `${token.slice(0, -3)}y`
  if (token.length > 5 && token.endsWith('ing')) return token.slice(0, -3)
  if (token.length > 4 && token.endsWith('ed')) return token.slice(0, -2)
  if (token.length > 4 && token.endsWith('es')) return token.slice(0, -2)
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1)
  return token
}

function tokenize(value, expand = false) {
  const base = value
    .toLowerCase()
    .replace(/non[\s-]?conformit(?:y|ies)/g, ' nonconformity ')
    .replace(/deep[\s-]?agents?/g, ' deepagents ')
    .replace(/model context protocol/g, ' mcp ')
    .replace(/google agent development kit/g, ' adk ')
    .replace(/[^a-z0-9+#%.]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token))
    .map(stem)

  if (!expand) return base

  const expanded = [...base]
  for (const token of base) {
    for (const related of termExpansions[token] || []) expanded.push(stem(related))
  }
  return expanded
}

function characterNgrams(value) {
  const normalized = ` ${value.toLowerCase().replace(/[^a-z0-9+#%]+/g, ' ').trim()} `
  const frequencies = new Map()
  for (let index = 0; index <= normalized.length - 3; index += 1) {
    const ngram = normalized.slice(index, index + 3)
    frequencies.set(ngram, (frequencies.get(ngram) || 0) + 1)
  }
  return frequencies
}

function sparseCosineSimilarity(left, right) {
  let dot = 0
  let leftMagnitude = 0
  let rightMagnitude = 0
  for (const value of left.values()) leftMagnitude += value * value
  for (const value of right.values()) rightMagnitude += value * value
  for (const [key, value] of left) dot += value * (right.get(key) || 0)
  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude) || 1)
}

function flattenProject(project) {
  return [
    project.title,
    project.category,
    project.systemType === 'agentic-ai' ? 'Agentic AI GenAI system' : 'engineering automation',
    project.oneLine,
    `Technology: ${project.stack.join(', ')}`,
    `Problem: ${project.problem}`,
    `Ownership: ${project.ownership}`,
    `Approach: ${project.approach.join(' ')}`,
    `Decisions and trade-offs: ${project.decisions.join(' ')}`,
    `Impact: ${project.impact.join(' ')}`,
    `Lessons learned: ${project.lessons.join(' ')}`,
    `Public-content boundary: ${project.confidentiality}`,
  ].join('\n')
}

function flattenExperience(role) {
  return [
    `${role.role} at ${role.company}, ${role.period}, ${role.location}.`,
    `${role.phase}. ${role.summary}`,
    role.highlights.join(' '),
    `Outcome: ${role.outcome}`,
  ].join(' ')
}

function sourceDetails(source) {
  if (source.id === 'profile-summary') {
    return [
      portfolio.profile.headline,
      portfolio.profile.supportingTitle,
      portfolio.profile.summary,
      portfolio.profile.about,
      `Location: ${portfolio.profile.location}`,
    ].join('\n')
  }

  if (source.id === 'skills-evidence') {
    return portfolio.skillGroups
      .map((group) => `${group.title}: ${group.items.map((item) => item.name).join(', ')}`)
      .join('\n')
  }

  if (source.id === 'career-history') {
    return portfolio.experience.map(flattenExperience).join('\n')
  }

  if (source.id === 'project-overview') {
    return portfolio.projects
      .map(
        (project) =>
          `${project.title} (${project.systemType === 'agentic-ai' ? 'Agentic AI or GenAI' : 'traditional engineering automation'}): ${project.oneLine}`,
      )
      .join('\n')
  }

  if (source.id === 'contact') {
    return `Location: ${portfolio.profile.location}. Email: ${portfolio.profile.email}. LinkedIn: ${portfolio.profile.linkedin}.`
  }

  const project = portfolio.projects.find((item) => item.sourceId === source.id)
  return project ? flattenProject(project) : ''
}

const sourceDocuments = portfolio.sourceSections.map((source, index) => {
  const details = sourceDetails(source)
  const searchText = `${source.title}\n${source.keywords.join(' ')}\n${source.content}\n${details}`
  const tokens = tokenize(searchText)
  const ngrams = characterNgrams(
    `${source.title}\n${source.keywords.join(' ')}\n${source.content}`,
  )
  const frequencies = new Map()
  for (const token of tokens) frequencies.set(token, (frequencies.get(token) || 0) + 1)
  return { source, details, searchText, tokens, ngrams, frequencies, index }
})

const averageDocumentLength =
  sourceDocuments.reduce((total, document) => total + document.tokens.length, 0) /
  sourceDocuments.length
const documentFrequency = new Map()
for (const document of sourceDocuments) {
  for (const token of new Set(document.tokens)) {
    documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1)
  }
}

function bm25Score(queryTokens, document) {
  let score = 0
  const k1 = 1.4
  const b = 0.72

  for (const token of queryTokens) {
    const frequency = document.frequencies.get(token) || 0
    if (!frequency) continue
    const containingDocuments = documentFrequency.get(token) || 0
    const idf = Math.log(
      1 + (sourceDocuments.length - containingDocuments + 0.5) / (containingDocuments + 0.5),
    )
    const denominator =
      frequency + k1 * (1 - b + b * (document.tokens.length / averageDocumentLength))
    score += idf * ((frequency * (k1 + 1)) / denominator)
  }

  return score
}

function intentBoost(question, sourceId) {
  const normalized = question.toLowerCase()
  let score = 0

  if (/\b(background|bio|professional journey|career journey)\b/.test(normalized)) {
    if (sourceId === 'profile-summary' || sourceId === 'career-history') score += 5
  }
  if (/\bwho is (vipin|he)\b/.test(normalized) && sourceId === 'profile-summary') score += 8
  if (/\b(compan(?:y|ies)|employers?|career|before|previously|progress(?:ion|ed)?)\b/.test(normalized)) {
    if (sourceId === 'career-history') score += 6
  }
  if (/\b(skill|capabilit|expertise|tech(?:nology)? stack|framework|platform|tools?)\b/.test(normalized)) {
    if (sourceId === 'skills-evidence') score += 5
  }
  if (/\b(suited?|suitable|fit|qualified)\b/.test(normalized)) {
    if (['profile-summary', 'skills-evidence', 'project-overview'].includes(sourceId)) score += 4
    if (sourceId === 'project-engineering-orchestrator') score += 3
  }
  if (/\b(where|location|contact|email|linkedin|reach|hire)\b/.test(normalized)) {
    if (sourceId === 'contact') score += 6
    if (sourceId === 'profile-summary') score += 2
  }
  if (/\b(which|what).*\b(projects?|systems?|work)\b/.test(normalized)) {
    if (sourceId === 'project-overview') score += 4
  }
  if (/\bquality\b/.test(normalized)) {
    if (['project-fmea-agents', 'project-non-conformity-agents'].includes(sourceId)) score += 6
  }
  if (/\bengineering domain|domain experience\b/.test(normalized)) {
    if (['career-history', 'profile-summary', 'skills-evidence'].includes(sourceId)) score += 8
  }
  if (/\bcae automation\b/.test(normalized) && sourceId === 'career-history') score += 10
  if (/\bvector databases?\b/.test(normalized)) {
    if (
      [
        'skills-evidence',
        'project-engineering-orchestrator',
        'project-non-conformity-agents',
      ].includes(sourceId)
    ) {
      score += 8
    }
  }

  return score
}

function rankSources(question, currentPath = '/') {
  const queryTokens = tokenize(question, true)
  const queryNgrams = characterNgrams(question)
  const normalized = question.toLowerCase()

  return sourceDocuments
    .map((document) => {
      const keywordText = document.source.keywords.join(' ').toLowerCase()
      const titleText = document.source.title.toLowerCase()
      let score = bm25Score(queryTokens, document)

      for (const keyword of document.source.keywords) {
        if (normalized.includes(keyword.toLowerCase())) score += 5
      }
      for (const token of new Set(queryTokens)) {
        if (token.length > 2 && tokenize(keywordText).includes(token)) score += 1.8
        if (token.length > 2 && tokenize(titleText).includes(token)) score += 1.4
      }

      const fuzzyScore = sparseCosineSimilarity(queryNgrams, document.ngrams)
      score += fuzzyScore * 4
      score += intentBoost(question, document.source.id)
      if (document.source.href === currentPath) score += 1.5
      return { ...document, fuzzyScore, score }
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
}

function selectRankedSources(ranked, question) {
  const topScore = ranked[0]?.score || 0
  if (topScore <= 0) {
    return portfolio.sourceSections.filter((source) =>
      ['profile-summary', 'project-overview', 'contact'].includes(source.id),
    )
  }

  const normalized = question.toLowerCase()
  const broadOrComparative =
    /\b(compare|versus|vs\.?|which projects?|what projects?|systems?|background|journey|suited?|suitable|domain experience|vector databases?)\b/.test(
      normalized,
    )
  const limit = broadOrComparative ? 5 : 4
  const minimumScore = Math.max(0.75, topScore * (broadOrComparative ? 0.25 : 0.4))

  return ranked
    .filter((item) => item.score >= minimumScore)
    .slice(0, limit)
    .map((item) => item.source)
}

function fixedPolicySources(question) {
  if (isPromptInjection(question)) {
    return portfolio.sourceSections.filter((source) =>
      ['profile-summary', 'project-overview', 'contact'].includes(source.id),
    )
  }

  if (
    /\b(salary|compensation|confidential|proprietary|secret|client names?|exact internal|internal metrics?)\b/i.test(
      question,
    )
  ) {
    return portfolio.sourceSections.filter((source) =>
      ['profile-summary', 'project-overview', 'contact'].includes(source.id),
    )
  }

  return null
}

export function isPromptInjection(value) {
  return injectionPatterns.some((pattern) => pattern.test(value))
}

export function buildRetrievalQuery(messages) {
  const userMessages = messages
    .filter((message) => message?.role === 'user' && typeof message.content === 'string')
    .map((message) => message.content.trim())
    .filter(Boolean)

  const question = userMessages.at(-1) || ''
  const previous = userMessages.at(-2)
  if (!previous) return question

  const normalizedQuestion = question.toLowerCase()
  const hasStandaloneTopic = sourceDocuments.some(
    ({ source }) =>
      normalizedQuestion.includes(source.title.toLowerCase()) ||
      source.keywords.some(
        (keyword) => keyword.length >= 3 && normalizedQuestion.includes(keyword.toLowerCase()),
      ),
  )
  const isFollowUp =
    !hasStandaloneTopic &&
    (question.split(/\s+/).length <= 8 ||
      /^(and|also|but|what about|how about|why|where|when|who)\b/i.test(question) ||
      /\b(it|its|that|this|they|their|those|he|his)\b/i.test(question))

  return isFollowUp ? `${previous}\nFollow-up: ${question}` : question
}

export function selectSources(question, currentPath = '/') {
  const fixedSources = fixedPolicySources(question)
  if (fixedSources) return fixedSources
  return selectRankedSources(rankSources(question, currentPath), question)
}

export function retrievalDiagnostics(question, currentPath = '/') {
  return rankSources(question, currentPath).map(({ source, score }) => ({
    sourceId: source.id,
    score: Number(score.toFixed(3)),
  }))
}

export function retrieveSources(question, currentPath = '/') {
  return selectSources(question, currentPath)
}

export function safeFallbackAnswer(question, sources) {
  if (isPromptInjection(question)) {
    return "I can explain Vipin's public experience and projects, but I can't reveal or change the guide's private instructions. Try asking about his agent architecture, engineering background, or selected work."
  }

  const normalized = question.toLowerCase()
  if (/\b(contact|email|linkedin|reach|hire)\b/.test(normalized)) {
    return 'Vipin is based in Munich. You can contact him at nvipin63@gmail.com or through LinkedIn at linkedin.com/in/vipin-n.'
  }

  if (sources.length === 0) {
    return "That detail is not in Vipin's public portfolio. I can help with his career history, agentic AI work, engineering background, or contact information."
  }

  const facts = sources.map((source) => source.content).join(' ')
  return `${facts} The linked sources below contain the approved public detail.`
}

export function buildGroundingPrompt(sources) {
  const context = sources
    .map((source) => {
      const document = sourceDocuments.find((item) => item.source.id === source.id)
      const details = document?.details ? `\n${document.details}` : ''
      return `[${source.id}] ${source.title}\n${source.content}${details}`
    })
    .join('\n\n')

  if (!sources.some((source) => source.id === 'project-overview')) return context

  const agenticSystems = portfolio.projects
    .filter((project) => project.systemType === 'agentic-ai')
    .map((project) => project.title)
    .join(', ')
  const automationSystems = portfolio.projects
    .filter((project) => project.systemType === 'engineering-automation')
    .map((project) => project.title)
    .join(', ')

  return `${context}

[project-classification] Explicit project classification
Agentic AI or GenAI systems: ${agenticSystems}.
Traditional engineering automation systems: ${automationSystems}.`
}

export function publicCitations(sources) {
  return sources.map(({ id, title, href }) => ({ id, title, href }))
}

export function contextualFollowUps(question, sources) {
  const candidates = []

  for (const source of sources) {
    if (source.id === 'project-overview') {
      candidates.push(
        'Which projects best demonstrate agentic AI?',
        'How do the AI projects differ from the automation work?',
        'Which project is most relevant to an Agentic AI role?',
      )
    } else if (source.id.startsWith('project-')) {
      const projectTitle = source.title.replace(/\s+case study$/i, '')
      candidates.push(
        `What problem did ${projectTitle} solve?`,
        `What technical decisions shaped ${projectTitle}?`,
        `What impact did ${projectTitle} have?`,
      )
      continue
    }

    if (source.id === 'career-history') {
      candidates.push(
        'How did Vipin progress across his career?',
        'Which engineering domains has Vipin worked in?',
        'How does his engineering background support his AI work?',
      )
    } else if (source.id === 'skills-evidence') {
      candidates.push(
        'Which AI frameworks has Vipin used?',
        'Where has Vipin applied these skills?',
        'Which cloud platforms appear in his work?',
      )
    } else if (source.id === 'profile-summary') {
      candidates.push(
        'What makes Vipin suited to an Agentic AI role?',
        'What is distinctive about his background?',
        'Which project should I review first?',
      )
    } else if (source.id === 'contact') {
      candidates.push(
        'Where is Vipin based?',
        'How can I contact Vipin?',
        'Which project should I review first?',
      )
    }
  }

  const normalizedQuestion = question.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ')
  const seen = new Set()
  return candidates
    .filter((candidate) => {
      const normalized = candidate.toLowerCase().replace(/[^a-z0-9]+/g, ' ')
      if (normalized === normalizedQuestion || seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
    .slice(0, 3)
}

export { portfolio }

import portfolio from '../src/data/portfolio.json' with { type: 'json' }

const injectionPatterns = [
  /ignore (all|any|the|your) (previous|prior|system|developer) instructions/i,
  /reveal (the )?(system|developer|hidden) prompt/i,
  /show (me )?(your )?(rules|instructions|prompt)/i,
  /act as (an?|the) (unrestricted|different|new)/i,
  /jailbreak|prompt injection|developer message/i,
]

const stopWords = new Set([
  'about',
  'after',
  'also',
  'and',
  'are',
  'can',
  'does',
  'for',
  'from',
  'has',
  'have',
  'him',
  'his',
  'how',
  'into',
  'is',
  'me',
  'of',
  'on',
  'the',
  'to',
  'vipin',
  'what',
  'why',
  'with',
])

function tokenize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token))
}

export function isPromptInjection(value) {
  return injectionPatterns.some((pattern) => pattern.test(value))
}

export function selectSources(question, currentPath = '/') {
  if (
    /\b(salary|compensation|confidential|proprietary|secret|client names?|exact internal|internal metrics?)\b/i.test(
      question,
    )
  ) {
    return portfolio.sourceSections.filter((source) =>
      ['profile-summary', 'project-overview', 'contact'].includes(source.id),
    )
  }

  const tokens = tokenize(question)

  const ranked = portfolio.sourceSections
    .map((source, sourceIndex) => {
      const keywordText = source.keywords.join(' ').toLowerCase()
      const contentText = `${source.title} ${source.content}`.toLowerCase()
      let score = 0

      for (const token of tokens) {
        if (source.keywords.some((keyword) => keyword.toLowerCase() === token)) score += 7
        else if (keywordText.includes(token)) score += 4
        if (source.title.toLowerCase().includes(token)) score += 3
        if (contentText.includes(token)) score += 1
      }

      if (source.href === currentPath) score += 2
      return { source, score, sourceIndex }
    })
    .sort((left, right) => right.score - left.score || left.sourceIndex - right.sourceIndex)

  const topScore = ranked[0]?.score || 0
  const minimumScore = Math.max(1, topScore * 0.35)
  const matched = ranked
    .filter((item) => item.score >= minimumScore)
    .slice(0, 3)
    .map((item) => item.source)
  if (matched.length > 0) return matched

  return portfolio.sourceSections.filter((source) =>
    ['profile-summary', 'project-overview', 'contact'].includes(source.id),
  )
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
  return sources
    .map((source) => `[${source.id}] ${source.title}\n${source.content}`)
    .join('\n\n')
}

export function publicCitations(sources) {
  return sources.map(({ id, title, href }) => ({ id, title, href }))
}

export { portfolio }

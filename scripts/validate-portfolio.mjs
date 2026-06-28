import cases from '../evals/portfolio-chat-cases.json' with { type: 'json' }
import {
  isPromptInjection,
  portfolio,
  publicCitations,
  selectSources,
} from '../server/portfolio-grounding.mjs'

const errors = []
const sourceIds = new Set(portfolio.sourceSections.map((source) => source.id))
const projectSlugs = new Set(portfolio.projects.map((project) => project.slug))

for (const metric of portfolio.metrics) {
  if (!sourceIds.has(metric.sourceId)) {
    errors.push(`Metric ${metric.id} references missing source ${metric.sourceId}`)
  }
}

for (const project of portfolio.projects) {
  if (!sourceIds.has(project.sourceId)) {
    errors.push(`Project ${project.slug} references missing source ${project.sourceId}`)
  }
  if (!project.confidentiality.trim()) {
    errors.push(`Project ${project.slug} is missing a confidentiality boundary`)
  }
}

for (const group of portfolio.skillGroups) {
  for (const skill of group.items) {
    for (const slug of skill.projectSlugs) {
      if (!projectSlugs.has(slug)) {
        errors.push(`Skill ${skill.name} references missing project ${slug}`)
      }
    }
  }
}

for (const testCase of cases) {
  const sources = selectSources(testCase.question)
  const selectedIds = sources.map((source) => source.id)
  const hasExpectedSource = testCase.expectedSources.some((sourceId) => selectedIds.includes(sourceId))

  if (!hasExpectedSource) {
    errors.push(
      `${testCase.id}: expected one of [${testCase.expectedSources.join(', ')}], selected [${selectedIds.join(', ')}]`,
    )
  }

  if (testCase.shouldRefuse && !isPromptInjection(testCase.question)) {
    errors.push(`${testCase.id}: injection pattern was not detected`)
  }

  if (Array.isArray(testCase.forbiddenTerms)) {
    const selectedContent = sources.map((source) => source.content).join(' ').toLowerCase()
    for (const term of testCase.forbiddenTerms) {
      if (selectedContent.includes(term.toLowerCase())) {
        errors.push(`${testCase.id}: selected context contains forbidden term "${term}"`)
      }
    }
  }

  const citations = publicCitations(sources)
  if (citations.some((citation) => !citation.id || !citation.title || !citation.href)) {
    errors.push(`${testCase.id}: citation contract is incomplete`)
  }
}

if (cases.length < 40) {
  errors.push(`Expected at least 40 assistant evaluations, found ${cases.length}`)
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(
    `Validated ${portfolio.projects.length} projects, ${portfolio.sourceSections.length} sources, and ${cases.length} assistant evaluations.`,
  )
}

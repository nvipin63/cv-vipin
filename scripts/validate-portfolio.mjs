import cases from '../evals/portfolio-chat-cases.json' with { type: 'json' }
import {
  isPromptInjection,
  portfolio,
  publicCitations,
  selectSources,
} from '../server/portfolio-grounding.mjs'
import { generateAgentDocuments } from '../server/portfolio-markdown.mjs'

const errors = []
const sourceIds = new Set(portfolio.sourceSections.map((source) => source.id))
const projectSlugs = new Set(portfolio.projects.map((project) => project.slug))
const allowedSystemTypes = new Set(['agentic-ai', 'engineering-automation'])

for (const project of portfolio.projects) {
  if (!allowedSystemTypes.has(project.systemType)) {
    errors.push(`Project ${project.slug} has invalid system type ${project.systemType}`)
  }
}

const agenticProjects = portfolio.projects.filter((project) => project.systemType === 'agentic-ai')
const automationProjects = portfolio.projects.filter(
  (project) => project.systemType === 'engineering-automation',
)
if (agenticProjects.length !== 5 || automationProjects.length !== 4) {
  errors.push(
    `Expected 5 Agentic AI and 4 automation projects, found ${agenticProjects.length} and ${automationProjects.length}`,
  )
}

const agentDocuments = generateAgentDocuments('https://cv-vipin.vercel.app')
if (!agentDocuments.index.startsWith(`# ${portfolio.profile.name}`)) {
  errors.push('llms.txt is missing the required portfolio heading')
}
if (!agentDocuments.index.includes('## Principal resources')) {
  errors.push('llms.txt is missing the principal resources section')
}
if (!agentDocuments.full.includes('## Public-content boundaries')) {
  errors.push('llms-full.txt is missing public-content boundaries')
}
if (agentDocuments.full.includes('](/')) {
  errors.push('llms-full.txt contains a non-canonical relative Markdown link')
}
if ('phone' in portfolio.profile) {
  errors.push('The public profile unexpectedly contains a phone number')
}

for (const metric of portfolio.metrics) {
  if (!agentDocuments.full.includes(metric.value) || !agentDocuments.full.includes(metric.label)) {
    errors.push(`llms-full.txt is missing metric ${metric.id}`)
  }
}

for (const experience of portfolio.experience) {
  if (
    !agentDocuments.full.includes(experience.role) ||
    !agentDocuments.full.includes(experience.company)
  ) {
    errors.push(`llms-full.txt is missing experience ${experience.id}`)
  }
}

for (const group of portfolio.skillGroups) {
  for (const skill of group.items) {
    if (!agentDocuments.full.includes(skill.name)) {
      errors.push(`llms-full.txt is missing skill ${skill.name}`)
    }
  }
}

for (const project of portfolio.projects) {
  if (!agentDocuments.full.includes(project.title)) {
    errors.push(`llms-full.txt is missing project ${project.slug}`)
  }
}

for (const source of portfolio.sourceSections) {
  if (!agentDocuments.full.includes(source.id) || !agentDocuments.full.includes(source.content)) {
    errors.push(`llms-full.txt is missing approved source ${source.id}`)
  }
}

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

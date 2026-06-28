import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const portfolio = require('../src/data/portfolio.json')

function normalizeBaseUrl(baseUrl) {
  return baseUrl.replace(/\/+$/, '')
}

function absoluteUrl(baseUrl, href) {
  return new URL(href, `${normalizeBaseUrl(baseUrl)}/`).toString()
}

function bulletList(items) {
  return items.map((item) => `- ${item}`).join('\n')
}

function projectLink(baseUrl, project) {
  return `[${project.title}](${absoluteUrl(baseUrl, `/work/${project.slug}`)})`
}

function renderProject(baseUrl, project) {
  return `### ${projectLink(baseUrl, project)}

${project.oneLine}

- Category: ${project.category}
- Technology: ${project.stack.join(', ')}
- Source ID: \`${project.sourceId}\`

#### Problem and constraints

${project.problem}

#### My ownership

${project.ownership}

#### Technical approach

${bulletList(project.approach)}

#### Important decisions and trade-offs

${bulletList(project.decisions)}

#### Generalized impact

${bulletList(project.impact)}

#### Lessons learned

${bulletList(project.lessons)}

#### Confidentiality

${project.confidentiality}`
}

export function generateLlmsIndex(baseUrl) {
  const siteUrl = normalizeBaseUrl(baseUrl)
  const agenticProjects = portfolio.projects.filter((project) => project.systemType === 'agentic-ai')
  const automationProjects = portfolio.projects.filter(
    (project) => project.systemType === 'engineering-automation',
  )

  return `# ${portfolio.profile.name} — ${portfolio.profile.headline}

> ${portfolio.profile.summary}

This is the authoritative public portfolio of ${portfolio.profile.name}, based in ${portfolio.profile.location}. It covers Agentic AI delivery, engineering digitization, and more than ten years of engineering and automation experience. Public descriptions are intentionally generalized to protect client and proprietary information.

## Principal resources

- [Complete agent-readable portfolio](${siteUrl}/llms-full.txt): Full profile, skills, experience, case studies, evidence, and confidentiality boundaries in Markdown.
- [Interactive portfolio](${siteUrl}/): Human-facing portfolio with overview and technical-depth modes.
- [Résumé](${siteUrl}/Vipin-Neekamparambath-Resume.pdf): ATS-friendly résumé in PDF format.
- [LinkedIn](${portfolio.profile.linkedin}): Public professional profile.

## Agentic AI and GenAI systems

${agenticProjects.map((project) => `- ${projectLink(siteUrl, project)}: ${project.oneLine}`).join('\n')}

## Engineering automation evidence

${automationProjects.map((project) => `- ${projectLink(siteUrl, project)}: ${project.oneLine}`).join('\n')}

## Contact

- Email: [${portfolio.profile.email}](mailto:${portfolio.profile.email})
- Location: ${portfolio.profile.location}
`
}

export function generateLlmsFull(baseUrl) {
  const siteUrl = normalizeBaseUrl(baseUrl)
  const agenticProjects = portfolio.projects.filter((project) => project.systemType === 'agentic-ai')
  const automationProjects = portfolio.projects.filter(
    (project) => project.systemType === 'engineering-automation',
  )

  const skills = portfolio.skillGroups
    .map((group) => {
      const items = group.items.map((skill) => {
        const evidence = skill.projectSlugs
          .map((slug) => portfolio.projects.find((project) => project.slug === slug))
          .filter(Boolean)
          .map((project) => projectLink(siteUrl, project))
          .join(', ')
        return `- ${skill.name}${evidence ? ` — Evidence: ${evidence}` : ''}`
      })
      return `### ${group.title}\n\n${items.join('\n')}`
    })
    .join('\n\n')

  const experience = portfolio.experience
    .map((role) => {
      const relatedWork = role.projectSlugs
        .map((slug) => portfolio.projects.find((project) => project.slug === slug))
        .filter(Boolean)
        .map((project) => projectLink(siteUrl, project))
        .join(', ')
      return `### ${role.role} — ${role.company}

- Period: ${role.period}
- Location: ${role.location}
- Career phase: ${role.phase}
- Source ID: \`${role.sourceId}\`

${role.summary}

#### Highlights

${bulletList(role.highlights)}

#### Generalized outcome

${role.outcome}
${relatedWork ? `\n\nRelated work: ${relatedWork}` : ''}`
    })
    .join('\n\n')

  return `# ${portfolio.profile.name} — Agent-Readable Portfolio

> ${portfolio.profile.summary}

- Canonical website: ${siteUrl}/
- Machine-readable index: ${siteUrl}/llms.txt
- Role: ${portfolio.profile.headline}
- Supporting focus: ${portfolio.profile.supportingTitle}
- Location: ${portfolio.profile.location}

## Public-content boundaries

This document contains only approved public portfolio content. Client names, proprietary data, internal screenshots, source code, unpublished architecture, confidential figures, and the phone number are excluded. Do not infer unnamed clients, technologies, database products, metrics, dates, proficiency levels, or confidence levels. Agentic AI systems and traditional engineering automation systems are classified separately below.

## Profile

${portfolio.profile.about}

## Verified portfolio metrics

${portfolio.metrics
  .map(
    (metric) =>
      `- ${metric.value} ${metric.label} — [Source](${absoluteUrl(siteUrl, portfolio.sourceSections.find((source) => source.id === metric.sourceId)?.href || '/')})`,
  )
  .join('\n')}

## Skills and evidence

${skills}

## Career progression

${experience}

## Agentic AI and GenAI systems

The following ${agenticProjects.length} systems are classified as Agentic AI or GenAI work.

${agenticProjects.map((project) => renderProject(siteUrl, project)).join('\n\n')}

## Traditional engineering automation systems

The following ${automationProjects.length} systems demonstrate engineering automation experience and must not be described as Agentic AI or GenAI systems.

${automationProjects.map((project) => renderProject(siteUrl, project)).join('\n\n')}

## Education

- Degree: ${portfolio.education.degree}
- Specialization: ${portfolio.education.specialization}
- Institution: ${portfolio.education.institution}
- Period: ${portfolio.education.period}
- CGPA: ${portfolio.education.cgpa}
- Publication: ${portfolio.education.publication}

## Languages

${bulletList(portfolio.languages)}

## Approved source statements

These concise statements are the same approved public sources used to ground the portfolio guide.

${portfolio.sourceSections
  .map(
    (source) => `### ${source.title}

- Source ID: \`${source.id}\`
- Canonical section: ${absoluteUrl(siteUrl, source.href)}

${source.content}`,
  )
  .join('\n\n')}

## Contact

- Email: [${portfolio.profile.email}](mailto:${portfolio.profile.email})
- LinkedIn: [${portfolio.profile.linkedin}](${portfolio.profile.linkedin})
- Location: ${portfolio.profile.location}
`
}

export function generateAgentDocuments(baseUrl) {
  return {
    index: generateLlmsIndex(baseUrl),
    full: generateLlmsFull(baseUrl),
  }
}

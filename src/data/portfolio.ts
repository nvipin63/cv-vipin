import portfolioData from './portfolio.json'

export interface Profile {
  name: string
  headline: string
  supportingTitle: string
  location: string
  email: string
  linkedin: string
  summary: string
  about: string
}

export interface Metric {
  id: string
  value: string
  label: string
  sourceId: string
}

export interface Experience {
  id: string
  company: string
  location: string
  role: string
  period: string
  phase: string
  summary: string
  highlights: string[]
  outcome: string
  projectSlugs: string[]
  sourceId: string
}

export interface ProjectCaseStudy {
  slug: string
  title: string
  category: string
  systemType: 'agentic-ai' | 'engineering-automation'
  featured: boolean
  oneLine: string
  stack: string[]
  problem: string
  ownership: string
  approach: string[]
  decisions: string[]
  impact: string[]
  lessons: string[]
  confidentiality: string
  sourceId: string
}

export interface SourceSection {
  id: string
  title: string
  href: string
  keywords: string[]
  content: string
}

export interface SkillEvidence {
  name: string
  projectSlugs: string[]
}

export interface SkillGroup {
  title: string
  items: SkillEvidence[]
}

export interface Portfolio {
  profile: Profile
  metrics: Metric[]
  experience: Experience[]
  projects: ProjectCaseStudy[]
  skillGroups: SkillGroup[]
  education: {
    degree: string
    specialization: string
    institution: string
    period: string
    publication: string
    cgpa: string
  }
  languages: string[]
  sourceSections: SourceSection[]
}

export const portfolio = portfolioData as Portfolio

export function getProject(slug: string) {
  return portfolio.projects.find((project) => project.slug === slug)
}

export function projectHref(slug: string) {
  return `/work/${slug}`
}

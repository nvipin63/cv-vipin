import { useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  LockKeyhole,
  Scale,
  Target,
  UserRound,
} from 'lucide-react'
import { getProject, portfolio, projectHref } from '../data/portfolio'
import { trackPortfolioEvent } from '../lib/analytics'

interface ProjectDetailProps {
  slug: string
}

function ListSection({
  icon: Icon,
  eyebrow,
  title,
  items,
}: {
  icon: typeof Target
  eyebrow: string
  title: string
  items: string[]
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          <h2 className="font-display text-xl font-semibold">{title}</h2>
        </div>
      </div>
      <ul className="space-y-3 text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function ProjectDetail({ slug }: ProjectDetailProps) {
  const project = getProject(slug)

  useEffect(() => {
    if (!project) return
    const previousTitle = document.title
    document.title = `${project.title} | Vipin Neekamparambath`
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', project.oneLine)
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', `${project.title} | Vipin Neekamparambath`)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', project.oneLine)
    trackPortfolioEvent('case_study_opened', { project: project.slug })

    return () => {
      document.title = previousTitle
    }
  }, [project])

  if (!project) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-3xl px-6 py-28 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold">That case study does not exist.</h1>
        <a href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to the portfolio
        </a>
      </main>
    )
  }

  const currentIndex = portfolio.projects.findIndex((item) => item.slug === slug)
  const nextProject = portfolio.projects[(currentIndex + 1) % portfolio.projects.length]

  return (
    <main>
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <a href="/#work" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            All selected work
          </a>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
              {project.category}
            </span>
            <span className="text-sm text-muted-foreground">Public, generalized case study</span>
          </div>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl md:text-6xl">
            {project.title}
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-relaxed text-muted-foreground">{project.oneLine}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <span key={item} className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-5 px-6 py-16 md:grid-cols-2 md:py-24">
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <Target className="h-6 w-6 text-primary" />
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">The problem</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">What had to change</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{project.problem}</p>
        </section>
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <UserRound className="h-6 w-6 text-primary" />
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Ownership</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">My role</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{project.ownership}</p>
        </section>

        <ListSection icon={ArrowRight} eyebrow="Approach" title="How the work was structured" items={project.approach} />
        <ListSection icon={Scale} eyebrow="Decisions" title="Trade-offs made explicit" items={project.decisions} />
        <ListSection icon={CheckCircle2} eyebrow="Impact" title="What improved" items={project.impact} />
        <ListSection icon={Lightbulb} eyebrow="Lessons" title="What the work reinforced" items={project.lessons} />

        <aside className="md:col-span-2 rounded-3xl border border-border bg-muted/30 p-6 md:p-8">
          <div className="flex gap-4">
            <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-display text-lg font-semibold">Confidentiality boundary</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{project.confidentiality}</p>
            </div>
          </div>
        </aside>

        {nextProject && (
          <a
            href={projectHref(nextProject.slug)}
            className="group md:col-span-2 mt-8 flex items-center justify-between rounded-3xl border border-border bg-card p-6 transition hover:border-primary/50 md:p-8"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Next case study</p>
              <p className="mt-2 font-display text-2xl font-semibold">{nextProject.title}</p>
            </div>
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </a>
        )}
      </div>
    </main>
  )
}

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Download,
  ExternalLink,
  FileSearch,
  GraduationCap,
  Layers3,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  X,
  Zap,
} from 'lucide-react'
import { portfolio, projectHref } from './data/portfolio'
import { trackPortfolioEvent } from './lib/analytics'

const PortfolioChat = lazy(() => import('./components/PortfolioChat'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))

type ViewMode = 'overview' | 'deep'

function ModeSwitchGlow({ sequence, className }: { sequence: number; className: string }) {
  if (sequence === 0) return null

  return (
    <div
      key={sequence}
      className={`pointer-events-none absolute -z-10 ${className}`}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0 rounded-[40%] bg-[conic-gradient(from_40deg,rgba(34,211,238,0.62),rgba(99,102,241,0.58),rgba(217,70,239,0.5),rgba(59,130,246,0.58),rgba(34,211,238,0.62))] blur-[58px]"
        initial={{ opacity: 0, scale: 0.82, rotate: -12 }}
        animate={{ opacity: [0, 0.48, 0.3, 0], scale: [0.82, 1, 1.08, 1.16], rotate: [-12, 4, 12, 18] }}
        transition={{ duration: 1.05, times: [0, 0.25, 0.65, 1], ease: 'easeOut' }}
      />
      <motion.div
        className="absolute inset-[14%] rounded-full bg-white/45 blur-3xl dark:bg-white/20"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 0.45, 0], scale: [0.7, 1.05, 1.18] }}
        transition={{ duration: 0.85, ease: 'easeOut' }}
      />
    </div>
  )
}

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.45 }}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
          <div className="mb-10 max-w-3xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
            {description && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description}</p>}
          </div>
          {children}
        </motion.div>
      </div>
    </section>
  )
}

function ViewModeToggle({
  mode,
  onChange,
  compact = false,
}: {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
  compact?: boolean
}) {
  return (
    <div
      className={`inline-flex rounded-full border border-border bg-card p-1 ${compact ? 'text-xs' : 'text-sm'}`}
      aria-label="Portfolio detail level"
    >
      {(['deep', 'overview'] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={mode === value}
          className={`rounded-full font-medium transition ${
            compact ? 'px-3 py-1.5' : 'px-4 py-2'
          } ${
            mode === value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {value === 'overview' ? '30-second scan' : 'Technical depth'}
        </button>
      ))}
    </div>
  )
}

function TopNav({
  dark,
  onThemeChange,
  mode,
  onModeChange,
  onAsk,
  projectPage,
}: {
  dark: boolean
  onThemeChange: () => void
  mode: ViewMode
  onModeChange: (mode: ViewMode) => void
  onAsk: () => void
  projectPage: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const detailedLinks = [
    ['Experience', `${projectPage ? '/' : ''}#experience`],
    ['Work', `${projectPage ? '/' : ''}#work`],
    ['Evidence', `${projectPage ? '/' : ''}#skills`],
    ['Contact', `${projectPage ? '/' : ''}#contact`],
  ]
  const links =
    !projectPage && mode === 'overview'
      ? [
          ['Snapshot', '#quick-scan'],
          ['Contact', '#contact'],
        ]
      : detailedLinks

  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl" aria-label="Primary navigation">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-5">
          <a href="/" className="font-display text-lg font-bold tracking-tight" aria-label="Vipin Neekamparambath, home">
            VN<span className="text-primary">.</span>
          </a>

          {!projectPage && (
            <div className="hidden lg:block">
              <ViewModeToggle mode={mode} onChange={onModeChange} compact />
            </div>
          )}
        </div>

        <div className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          {links.map(([label, href]) => (
            <a key={label} className="transition-colors hover:text-foreground" href={href}>
              {label}
            </a>
          ))}
          <button
            id="ask-cv-trigger"
            type="button"
            onClick={onAsk}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 font-medium text-primary hover:border-primary/50"
          >
            <Bot className="h-4 w-4" />
            Ask the CV
          </button>
          <button
            type="button"
            onClick={onThemeChange}
            className="rounded-full border border-border bg-card p-2.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={dark ? 'Use light theme' : 'Use dark theme'}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onThemeChange}
            className="rounded-full border border-border bg-card p-2.5 text-muted-foreground"
            aria-label={dark ? 'Use light theme' : 'Use dark theme'}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="rounded-full border border-border bg-card p-2.5 text-muted-foreground"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-navigation" className="border-t border-border bg-background px-6 py-5 md:hidden">
          {!projectPage && <ViewModeToggle mode={mode} onChange={onModeChange} compact />}
          <div className="mt-5 grid gap-2">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 font-medium hover:bg-muted"
              >
                {label}
              </a>
            ))}
            <button
              id="ask-cv-trigger-mobile"
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onAsk()
              }}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground"
            >
              <Bot className="h-4 w-4" />
              Ask the CV
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

function CareerExplorer({ mode }: { mode: ViewMode }) {
  const [activeId, setActiveId] = useState(portfolio.experience[0]?.id ?? '')
  const active = portfolio.experience.find((item) => item.id === activeId) ?? portfolio.experience[0]

  if (!active) return null

  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
      <div className="rounded-3xl border border-border bg-card p-3" role="tablist" aria-label="Career progression">
        {portfolio.experience.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active.id === item.id}
            aria-controls="career-detail"
            onClick={() => setActiveId(item.id)}
            className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition ${
              active.id === item.id ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-xs ${
                active.id === item.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'
              }`}
            >
              {String(portfolio.experience.length - index).padStart(2, '0')}
            </span>
            <span className="min-w-0">
              <span className="block font-display font-semibold text-foreground">{item.phase}</span>
              <span className="block truncate text-xs">{item.company} · {item.period}</span>
            </span>
          </button>
        ))}
      </div>

      <motion.article
        key={active.id}
        id="career-detail"
        role="tabpanel"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-3xl border border-border bg-card p-6 md:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">{active.phase}</p>
            <h3 className="mt-2 font-display text-2xl font-semibold">{active.role}</h3>
            <p className="mt-1 font-medium text-primary">{active.company}</p>
          </div>
          <div className="text-sm text-muted-foreground lg:text-right">
            <p>{active.period}</p>
            <p className="mt-1 inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {active.location}
            </p>
          </div>
        </div>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{active.summary}</p>
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Outcome</p>
          <p className="mt-2 font-medium">{active.outcome}</p>
        </div>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
          {(mode === 'deep' ? active.highlights : active.highlights.slice(0, 2)).map((highlight) => (
            <li key={highlight} className="flex gap-3">
              <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
              {highlight}
            </li>
          ))}
        </ul>
        {active.projectSlugs.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-2 border-t border-border pt-5">
            {active.projectSlugs.slice(0, mode === 'deep' ? undefined : 2).map((slug) => {
              const project = portfolio.projects.find((item) => item.slug === slug)
              return project ? (
                <a
                  key={slug}
                  href={projectHref(slug)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:border-primary/50"
                >
                  Evidence: {project.title}
                </a>
              ) : null
            })}
          </div>
        )}
      </motion.article>
    </div>
  )
}

function ProjectExplorer({ mode }: { mode: ViewMode }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const categories = ['All', ...new Set(portfolio.projects.map((project) => project.category))]
  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return portfolio.projects.filter((project) => {
      const matchesCategory = category === 'All' || project.category === category
      const systemLabel =
        project.systemType === 'agentic-ai' ? 'Agentic AI GenAI' : 'engineering automation'
      const haystack = [project.title, project.oneLine, project.category, systemLabel, ...project.stack].join(' ').toLowerCase()
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery)
      const matchesMode = mode === 'deep' || project.featured || normalizedQuery.length > 0 || category !== 'All'
      return matchesCategory && matchesQuery && matchesMode
    })
  }, [category, mode, query])

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search case studies</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, stacks, or domains"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/50"
          />
        </label>
        <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1" aria-label="Filter case studies">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium ${
                category === item ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-muted-foreground'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {visibleProjects.map((project, index) => (
          <motion.a
            key={project.slug}
            href={projectHref(project.slug)}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ delay: index * 0.04 }}
            className="group flex min-h-72 flex-col rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 md:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                  {project.category}
                </span>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                  {project.systemType === 'agentic-ai' ? 'Agentic AI / GenAI' : 'Engineering automation'}
                </span>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <h3 className="mt-7 font-display text-2xl font-semibold">{project.title}</h3>
            <p className="mt-4 flex-1 leading-relaxed text-muted-foreground">{project.oneLine}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.stack.slice(0, 3).map((item) => (
                <span key={item} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-6 inline-flex items-center gap-2 font-medium text-primary">
              Read the evidence trail
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </p>
          </motion.a>
        ))}
      </div>
      {visibleProjects.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No case studies match that search.
        </div>
      )}
    </>
  )
}

function QuickScan({ onDeep }: { onDeep: () => void }) {
  const evidenceSlugs = ['engineering-orchestrator', 'fmea-agents', 'requirements-agents']
  const evidence = evidenceSlugs
    .map((slug) => portfolio.projects.find((project) => project.slug === slug))
    .filter((project) => project !== undefined)
  const agentSkills = [
    'Multi-agent orchestration',
    'LangChain',
    'LangGraph',
    'Deep Agents',
    'Google ADK',
    'RAG + vector databases',
    'MCP',
    'LLMs',
    'Azure AI Foundry',
  ]

  return (
    <Section
      id="quick-scan"
      eyebrow="30-second scan"
      title="Agentic AI, grounded in real engineering work"
      description="I architect production-minded agent systems for requirements, quality, PLM, and simulation—backed by 10+ years inside engineering workflows."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5">
          <Bot className="h-5 w-5 text-primary" />
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">What I build</p>
          <h3 className="mt-2 font-display text-lg font-semibold">Enterprise agentic systems</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Multi-agent workflows that coordinate trusted knowledge, engineering tools, validation, and human decisions.
          </p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <Layers3 className="h-5 w-5 text-primary" />
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Current ownership</p>
          <h3 className="mt-2 font-display text-lg font-semibold">Architecture through delivery</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Engineering Orchestrator architecture plus development leadership for FMEA and requirements agents.
          </p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <BriefcaseBusiness className="h-5 w-5 text-primary" />
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Why it matters</p>
          <h3 className="mt-2 font-display text-lg font-semibold">Engineering-native AI</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Deep experience across CAE, PLM, requirements, quality, simulation, automation, and stakeholder delivery.
          </p>
        </article>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Core Agentic AI skills</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {agentSkills.map((skill) => (
            <span key={skill} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Best evidence</p>
            <h3 className="mt-1 font-display text-lg font-semibold">Three Agentic AI case studies</h3>
          </div>
          <button
            type="button"
            onClick={onDeep}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:border-primary/50"
          >
            View full technical depth
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {evidence.map((project) => (
            <a
              key={project.slug}
              href={projectHref(project.slug)}
              className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-background p-4 hover:border-primary/50"
            >
              <div>
                <p className="font-display text-sm font-semibold group-hover:text-primary">{project.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{project.oneLine}</p>
              </div>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            </a>
          ))}
        </div>
      </div>
    </Section>
  )
}

function HomePage({
  mode,
  modeSwitchSequence,
  onModeChange,
  onAsk,
}: {
  mode: ViewMode
  modeSwitchSequence: number
  onModeChange: (mode: ViewMode) => void
  onAsk: () => void
}) {
  const profile = portfolio.profile
  const heroCopy =
    mode === 'overview'
      ? {
          lead: 'Agentic AI, grounded in',
          emphasis: 'real engineering work.',
          summary:
            'A 30-second view of how I use multi-agent orchestration, LangGraph, Deep Agents, RAG and MCP across PLM, requirements, quality and simulation.',
        }
      : {
          lead: 'Turning complex engineering workflows into',
          emphasis: 'reliable agentic systems.',
          summary:
            'I combine 10+ years of engineering experience with Agentic AI to build systems for PLM, requirements, quality and simulation.',
        }
  const switchAndScroll = (nextMode: ViewMode, targetId: string) => {
    onModeChange(nextMode)
    window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }

  return (
    <main>
      <header id="top" className="relative border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-[length:24px_24px] [background-image:radial-gradient(circle,hsl(var(--dot-grid))_1px,transparent_1px)]" />
        <div className="absolute left-1/2 top-0 -z-10 h-[34rem] w-[60rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1fr_19rem]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative isolate"
          >
            <ModeSwitchGlow sequence={modeSwitchSequence} className="-inset-x-12 inset-y-8" />
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm text-primary">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_14px_hsl(var(--primary))]" />
              {profile.location}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <p className="mt-8 font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  Vipin Neekamparambath · Agentic AI Engineer
                </p>
                <h1 className="mt-3 max-w-4xl font-display text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl md:text-7xl">
                  {heroCopy.lead}
                  <motion.span
                    className="mt-3 block text-gradient-theme"
                    style={{ backgroundSize: '200% 100%' }}
                    initial={{ backgroundPosition: '100% 50%' }}
                    animate={{ backgroundPosition: '0% 50%' }}
                    transition={{ duration: 0.65, ease: 'easeOut' }}
                  >
                    {heroCopy.emphasis}
                  </motion.span>
                </h1>
                <p className="mt-7 max-w-3xl text-xl leading-relaxed text-muted-foreground">
                  {heroCopy.summary}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <button
                id="ask-cv-trigger-hero"
                type="button"
                onClick={onAsk}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <Bot className="h-4 w-4" />
                Ask the CV
              </button>
              <button
                type="button"
                onClick={() => switchAndScroll('deep', 'work')}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 font-medium transition-colors hover:border-primary/50"
              >
                <Layers3 className="h-4 w-4" />
                Explore technical depth
              </button>
              <a
                href="/Vipin-Neekamparambath-Resume.pdf"
                download
                onClick={() => trackPortfolioEvent('resume_downloaded')}
                className="inline-flex items-center gap-2 rounded-full px-4 py-3 font-medium text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" />
                Résumé
              </a>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="relative isolate mx-auto"
          >
            <ModeSwitchGlow sequence={modeSwitchSequence} className="-inset-10" />
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-theme opacity-30 blur-3xl" />
            <figure className="relative aspect-square w-48 overflow-hidden rounded-[2rem] border border-white/15 bg-card shadow-2xl sm:w-52">
              <img
                src="/vipin-profile.jpg"
                alt="Portrait of Vipin Neekamparambath"
                width="900"
                height="1200"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent px-6 pb-6 pt-16 text-white">
                <figcaption className="font-display text-lg font-semibold">Vipin Neekamparambath</figcaption>
              </div>
            </figure>
          </motion.aside>

          <div className="lg:col-span-2 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => switchAndScroll('overview', 'quick-scan')}
              className="group rounded-2xl border border-border bg-card/80 p-4 text-left backdrop-blur hover:border-primary/50"
            >
              <FileSearch className="h-5 w-5 text-primary" />
              <p className="mt-4 font-display font-semibold">30-second scan</p>
              <p className="mt-1 text-xs text-muted-foreground">Only the decision-relevant highlights</p>
            </button>
            <button
              type="button"
              onClick={() => switchAndScroll('deep', 'work')}
              className="group rounded-2xl border border-border bg-card/80 p-4 text-left backdrop-blur hover:border-primary/50"
            >
              <Zap className="h-5 w-5 text-primary" />
              <p className="mt-4 font-display font-semibold">Technical deep dive</p>
              <p className="mt-1 text-xs text-muted-foreground">Decisions, trade-offs, and lessons</p>
            </button>
            <button
              type="button"
              onClick={onAsk}
              className="group rounded-2xl border border-border bg-card/80 p-4 text-left backdrop-blur hover:border-primary/50"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="mt-4 font-display font-semibold">Ask the portfolio</p>
              <p className="mt-1 text-xs text-muted-foreground">Cited answers from approved content</p>
            </button>
          </div>
        </div>
      </header>

      <section aria-label="Career proof" className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-6 md:grid-cols-4">
          {portfolio.metrics.map((metric) => (
            <div key={metric.id} className="border-border px-4 py-6 first:pl-0 odd:border-r md:border-r md:last:border-r-0 md:last:pr-0">
              <p className="font-display text-3xl font-bold text-primary">{metric.value}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      {mode === 'overview' ? (
        <QuickScan onDeep={() => switchAndScroll('deep', 'experience')} />
      ) : (
        <>
          <Section
            id="about"
            eyebrow="Positioning"
            title="Engineering depth, applied to AI systems"
          >
            <div className="grid gap-8 md:grid-cols-[1.4fr_0.6fr]">
              <p className="text-xl leading-relaxed text-muted-foreground">{profile.about}</p>
              <div className="rounded-3xl border border-border bg-card p-6">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Working principle</p>
                <p className="mt-4 font-display text-xl font-semibold">
                  Make agent behavior inspectable, grounded, and useful inside the real engineering process.
                </p>
              </div>
            </div>
          </Section>

          <div className="bg-muted/30">
            <Section
              id="experience"
              eyebrow="Career progression"
              title="From automating engineering tasks to orchestrating agent systems"
              description="Select a chapter to see how each role built the foundation for the next."
            >
              <CareerExplorer mode={mode} />
            </Section>
          </div>

          <Section
            id="work"
            eyebrow="Selected work"
            title="Evidence over adjectives"
            description="Nine generalized case studies covering the problem, ownership, approach, decisions, impact, and lessons."
          >
            <ProjectExplorer mode={mode} />
          </Section>

          <div className="bg-muted/30">
            <Section
              id="skills"
              eyebrow="Evidence map"
              title="Every capability links to work that demonstrates it"
            >
              <div className="grid gap-5 md:grid-cols-3">
                {portfolio.skillGroups.map((group) => (
                  <article key={group.title} className="rounded-3xl border border-border bg-card p-6">
                    <h3 className="font-display text-xl font-semibold">{group.title}</h3>
                    <div className="mt-5 space-y-3">
                      {group.items.map((skill) => {
                        const firstProject = portfolio.projects.find((project) => project.slug === skill.projectSlugs[0])
                        return firstProject ? (
                          <a
                            key={skill.name}
                            href={projectHref(firstProject.slug)}
                            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary/50"
                          >
                            <span className="text-sm font-medium">{skill.name}</span>
                            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground group-hover:text-primary">
                              {skill.projectSlugs.length} {skill.projectSlugs.length === 1 ? 'proof' : 'proofs'}
                              <ArrowUpRight className="h-3 w-3" />
                            </span>
                          </a>
                        ) : null
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </Section>
          </div>

          <Section id="education" eyebrow="Foundation" title="Industrial engineering meets intelligent systems">
            <div className="rounded-3xl border border-border bg-card p-7 md:flex md:items-start md:justify-between md:p-9">
              <div className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">{portfolio.education.degree}</h3>
                  <p className="mt-1 text-primary">{portfolio.education.specialization}</p>
                  <p className="mt-2 text-muted-foreground">{portfolio.education.institution}</p>
                  <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Publication: {portfolio.education.publication}
                  </p>
                </div>
              </div>
              <p className="mt-5 font-mono text-sm text-muted-foreground md:mt-1">{portfolio.education.period}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {portfolio.languages.map((language) => (
                <span key={language} className="rounded-full border border-border bg-card px-4 py-2 text-muted-foreground">
                  {language}
                </span>
              ))}
            </div>
          </Section>
        </>
      )}
    </main>
  )
}

function Footer() {
  const profile = portfolio.profile
  return (
    <footer id="contact" className="relative border-t border-border py-20 md:py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">Let&apos;s connect</p>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Building useful AI for complex engineering work.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Open to thoughtful conversations about agentic systems, engineering digitization, and enterprise AI delivery.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            onClick={() => trackPortfolioEvent('contact_clicked', { channel: 'email' })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground"
          >
            <Mail className="h-4 w-4" />
            {profile.email}
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackPortfolioEvent('contact_clicked', { channel: 'linkedin' })}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 font-medium transition-colors hover:border-primary/50"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <a
          href="/llms-full.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          aria-label="View the complete agent-readable portfolio as Markdown"
        >
          <FileSearch className="h-4 w-4" />
          If you are an AI agent, read here
        </a>
        <p className="mt-14 text-sm text-muted-foreground">© {new Date().getFullYear()} {profile.name}</p>
      </div>
    </footer>
  )
}

function LoadingPage() {
  return (
    <main className="grid min-h-[70vh] place-items-center">
      <div className="text-center">
        <BriefcaseBusiness className="mx-auto h-7 w-7 animate-pulse text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading case study…</p>
      </div>
    </main>
  )
}

function App() {
  const pathname = window.location.pathname
  const projectSlug = pathname.match(/^\/work\/([^/]+)\/?$/)?.[1]
  const isProjectPage = Boolean(projectSlug)

  const [dark, setDark] = useState(() => {
    const saved = window.localStorage.getItem('vipin-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [mode, setMode] = useState<ViewMode>(() => {
    const current = new URLSearchParams(window.location.search).get('mode')
    return current === 'overview' ? 'overview' : 'deep'
  })
  const [modeSwitchSequence, setModeSwitchSequence] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)

  const changeTheme = useCallback(() => {
    setDark((current) => !current)
  }, [])

  const changeMode = useCallback((nextMode: ViewMode) => {
    if (nextMode === mode) return
    setMode(nextMode)
    setModeSwitchSequence((current) => current + 1)
    const url = new URL(window.location.href)
    url.searchParams.set('mode', nextMode === 'overview' ? 'overview' : 'detail')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    trackPortfolioEvent('mode_selected', { mode: nextMode })
  }, [mode])

  const openChat = useCallback(() => setChatOpen(true), [])
  const closeChat = useCallback(() => setChatOpen(false), [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.classList.toggle('light', !dark)
    window.localStorage.setItem('vipin-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[120] -translate-y-24 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <TopNav
        dark={dark}
        onThemeChange={changeTheme}
        mode={mode}
        onModeChange={changeMode}
        onAsk={openChat}
        projectPage={isProjectPage}
      />
      <div id="main-content" tabIndex={-1}>
        {projectSlug ? (
          <Suspense fallback={<LoadingPage />}>
            <ProjectDetail slug={projectSlug} />
          </Suspense>
        ) : (
          <HomePage
            mode={mode}
            modeSwitchSequence={modeSwitchSequence}
            onModeChange={changeMode}
            onAsk={openChat}
          />
        )}
      </div>
      <Footer />
      {chatOpen && (
        <Suspense fallback={null}>
          <PortfolioChat open={chatOpen} onClose={closeChat} />
        </Suspense>
      )}
      </div>
    </MotionConfig>
  )
}

export default App

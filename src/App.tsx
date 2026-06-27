import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import {
  ArrowDown,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Code2,
  Download,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Moon,
  Network,
  Sparkles,
  Sun,
  Wrench,
} from 'lucide-react'

const roles = [
  'Agentic AI Engineer',
  'GenAI Solution Architect',
  'Engineering Digitization Lead',
]

const experience = [
  {
    company: 'Accenture DACH',
    location: 'Munich, Germany',
    role: 'Senior Analyst',
    period: 'Aug 2023 - Present',
    summary:
      'Leading Agentic AI and GenAI initiatives for product lifecycle management and engineering digitization.',
    highlights: [
      'Architect an Engineering Orchestrator that coordinates agents across requirements, PLM, design, simulation, and downstream lifecycle workflows.',
      'Serve as development lead for end-to-end FMEA agents, shaping workflow decomposition, agent responsibilities, prompts, tools, and validation.',
      'Lead delivery of requirements engineering and requirements management agents using the Deep Agents framework.',
      'Develop retrieval and knowledge-management capabilities that connect critical engineering data with reusable process guidance.',
    ],
  },
  {
    company: 'Altair Engineering',
    location: 'Bengaluru, India',
    role: 'Technical Specialist',
    period: 'Jan 2022 - Jul 2023',
    summary:
      'Owned planning, client engagement, requirements, and delivery for engineering automation initiatives.',
    highlights: [
      'Designed, tested, and deployed automation tools for Altair pre-processing, post-processing, and report generation.',
      'Delivered end-to-end CAE automation that reduced repetitive effort and improved workflow consistency.',
    ],
  },
  {
    company: 'ZF Friedrichshafen',
    location: 'Hyderabad, India',
    role: 'Specialist',
    period: 'Jun 2021 - Jan 2022',
    summary:
      'Made reusable engineering automation easier to discover, govern, and share across divisions.',
    highlights: [
      'Managed a centralized Azure Repos library for engineering macro collections.',
      'Built a Microsoft Power Apps script-library application for cross-functional teams.',
    ],
  },
  {
    company: 'Valeo',
    location: 'Chennai, India',
    role: 'Automation Engineer',
    period: 'Jan 2018 - Jun 2021',
    summary:
      'Founded the Chennai CAE automation team and served as its single point of contact.',
    highlights: [
      'Established work instructions, GUI and script templates, quality checklists, and team standards.',
      'Built dashboards to track specifications, delivery progress, and engineering time savings.',
    ],
  },
  {
    company: 'Tata Consultancy Services',
    location: 'Bengaluru, India',
    role: 'Systems Engineer',
    period: 'Nov 2014 - Dec 2017',
    summary:
      'Built an engineering foundation across CAE automation, vehicle safety, and mechanical design.',
    highlights: [
      'Created HyperWorks scripts that improved FE modelling efficiency and reinforced CAE quality standards.',
      'Supported vehicle subsystem assembly in HyperMesh and engineering revisions in UG NX.',
    ],
  },
]

const projects = [
  {
    icon: Network,
    title: 'Engineering Orchestrator',
    stack: 'Agentic AI · LangChain · Azure · RAG · MCP',
    description:
      'A multi-agent platform that coordinates requirements, PLM, design, simulation, and lifecycle workflows through shared tools, enterprise knowledge, and process logic.',
  },
  {
    icon: Bot,
    title: 'FMEA Analysis Agents',
    stack: 'LangGraph · LLM orchestration',
    description:
      'End-to-end agents for workflow decomposition, context retrieval, analysis guidance, validation, and structured engineering outputs.',
  },
  {
    icon: Sparkles,
    title: 'Requirements Engineering Agents',
    stack: 'Deep Agents',
    description:
      'Agents that assist requirements elicitation, analysis, interpretation, management, and traceability-oriented workflows.',
  },
  {
    icon: Wrench,
    title: 'Non-Conformity Agents',
    stack: 'GenAI · RAG',
    description:
      'Quality-workflow agents that help engineers navigate context, supporting evidence, and process-driven next actions.',
  },
  {
    icon: Code2,
    title: 'FEM Copilot',
    stack: 'GenAI · FEM · Simulation automation',
    description:
      'A context-aware assistant for model creation, boundary conditions, material selection, and finite-element analysis steps.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Chassis Automation Tool',
    stack: 'HyperMesh · Tcl/Tk',
    description:
      'Interactive and batch automation for CAD organization, mesh creation, seam weld creation, and engineering quality checks.',
  },
]

const skillGroups = [
  {
    title: 'Agentic AI',
    skills: ['Multi-agent orchestration', 'LangChain', 'LangGraph', 'Deep Agents', 'MCP', 'Tool integration'],
  },
  {
    title: 'GenAI & Data',
    skills: ['LLMs', 'RAG', 'Prompt design', 'Knowledge retrieval', 'Azure AI Foundry', 'GCP'],
  },
  {
    title: 'Engineering',
    skills: ['PLM', 'Requirements engineering', 'FMEA', 'CAE', 'FEM', 'Engineering automation'],
  },
  {
    title: 'Development',
    skills: ['Python', 'Tcl/Tk', 'Google Apps Script', 'Azure Repos', 'Power Apps'],
  },
  {
    title: 'Delivery',
    skills: ['Agile delivery', 'Project management', 'Stakeholder management', 'Technical leadership'],
  },
  {
    title: 'Collaboration',
    skills: ['Cross-functional collaboration', 'Training delivery', 'Problem solving', 'Analytical thinking'],
  },
]

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
          <h2 className="mb-10 font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          {children}
        </motion.div>
      </div>
    </section>
  )
}

function App() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const interval = window.setInterval(
      () => setRoleIndex((current) => (current + 1) % roles.length),
      2600,
    )
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.classList.toggle('light', !dark)
  }, [dark])

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-[length:24px_24px] [background-image:radial-gradient(circle,hsl(var(--dot-grid))_1px,transparent_1px)]" />
      <div className="fixed left-1/2 top-0 -z-10 h-[34rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#top" className="font-display text-lg font-bold tracking-tight">
            VN<span className="text-primary">.</span>
          </a>
          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a className="transition-colors hover:text-foreground" href="#experience">Experience</a>
            <a className="transition-colors hover:text-foreground" href="#projects">Projects</a>
            <a className="transition-colors hover:text-foreground" href="#skills">Skills</a>
            <a className="transition-colors hover:text-foreground" href="#contact">Contact</a>
          </div>
          <button
            type="button"
            onClick={() => setDark((value) => !value)}
            className="rounded-full border border-border bg-card p-2.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={dark ? 'Use light theme' : 'Use dark theme'}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <header id="top" className="relative">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-[1fr_auto]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="min-w-0"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm text-primary">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_16px_hsl(var(--primary))]" />
              Munich, Germany
            </div>
            <p className="mb-3 text-lg text-muted-foreground">Hi, I&apos;m</p>
            <h1 className="max-w-4xl font-display font-bold leading-[0.98] tracking-[-0.05em]">
              <span className="block text-5xl sm:text-6xl md:text-7xl">Vipin</span>
              <span className="block text-[7.5vw] sm:text-6xl md:text-7xl bg-gradient-to-r from-[hsl(var(--gradient-from))] to-[hsl(var(--gradient-to))] bg-clip-text text-transparent">
                Neekamparambath
              </span>
            </h1>
            <div className="mt-8 h-10 overflow-hidden">
              <motion.p
                key={roles[roleIndex]}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="font-display text-xl font-medium text-muted-foreground md:text-2xl"
              >
                {roles[roleIndex]}
              </motion.p>
            </div>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              I design and deliver AI-powered enterprise solutions that connect complex engineering
              workflows, coordinated agents, trusted knowledge, and the tools engineers already use.
            </p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="mailto:nvipin63@gmail.com"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <Mail className="h-4 w-4" />
                Get in touch
              </a>
              <a
                href="/Vipin-Neekamparambath-Resume.pdf"
                download
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 font-medium transition-colors hover:border-primary/50"
              >
                <Download className="h-4 w-4" />
                Download resume
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.65 }}
            className="relative mx-auto hidden lg:block"
          >
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary to-accent opacity-35 blur-3xl" />
            <div className="relative grid h-64 w-64 place-items-center rounded-[3rem] border border-white/15 bg-card/80 shadow-2xl backdrop-blur">
              <span className="bg-gradient-to-br from-[hsl(var(--gradient-from))] to-[hsl(var(--gradient-to))] bg-clip-text font-display text-8xl font-bold tracking-[-0.08em] text-transparent">
                VN
              </span>
            </div>
          </motion.div>

          <a
            href="#about"
            aria-label="Scroll to profile"
            className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce text-muted-foreground md:block"
          >
            <ArrowDown className="h-5 w-5" />
          </a>
        </div>
      </header>

      <Section id="about" eyebrow="Profile" title="Engineering depth, applied to AI">
        <div className="grid gap-8 md:grid-cols-[1.4fr_0.6fr]">
          <p className="text-xl leading-relaxed text-muted-foreground">
            With 10+ years across engineering and digital transformation, I now focus on practical
            agent architecture: multi-agent orchestration, retrieval-augmented generation,
            MCP-enabled tool integration, and AI copilots. I combine Python development and
            engineering-domain knowledge with agile delivery, technical leadership, and stakeholder
            alignment.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['10+', 'Years in engineering'],
              ['5', 'Industry roles'],
              ['6', 'Featured projects'],
              ['3', 'Languages'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4">
                <p className="font-display text-2xl font-bold text-primary">{value}</p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="bg-muted/30">
        <Section id="experience" eyebrow="Career" title="From engineering automation to agentic AI">
          <div className="relative space-y-6 before:absolute before:bottom-4 before:left-[1.15rem] before:top-4 before:w-px before:bg-border md:before:left-[8.5rem]">
            {experience.map((item, index) => (
              <motion.article
                key={item.company}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: index * 0.05 }}
                className="relative grid gap-4 pl-12 md:grid-cols-[7rem_1fr] md:pl-0"
              >
                <p className="pt-6 text-xs font-medium text-muted-foreground md:text-right">{item.period}</p>
                <span className="absolute left-[0.78rem] top-7 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.15)] md:left-[8.13rem]" />
                <div className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold">{item.company}</h3>
                      <p className="mt-1 font-medium text-primary">{item.role}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {item.location}
                    </span>
                  </div>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{item.summary}</p>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {item.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
        </Section>
      </div>

      <Section id="projects" eyebrow="Selected work" title="Systems that connect AI with engineering">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const Icon = project.icon
            return (
              <motion.article
                key={project.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.06 }}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold">{project.title}</h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-primary">{project.stack}</p>
                <p className="mt-4 leading-relaxed text-muted-foreground">{project.description}</p>
              </motion.article>
            )
          })}
        </div>
      </Section>

      <div className="bg-muted/30">
        <Section id="skills" eyebrow="Capabilities" title="A toolkit for production AI delivery">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((group) => (
              <div key={group.title} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-display font-semibold">{group.title}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section id="education" eyebrow="Education" title="Industrial engineering meets intelligent systems">
        <div className="rounded-3xl border border-border bg-card p-7 md:flex md:items-start md:justify-between md:p-9">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold">Master of Technology</h3>
              <p className="mt-1 text-primary">Industrial Engineering &amp; Management</p>
              <p className="mt-2 text-muted-foreground">National Institute of Technology Calicut</p>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Publication: Optimization of assembly job-shop scheduling using priority dispatching rules
              </p>
            </div>
          </div>
          <p className="mt-5 font-mono text-sm text-muted-foreground md:mt-1">2012 - 2014</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {['English', 'Hindi', 'German · A1'].map((language) => (
            <span key={language} className="rounded-full border border-border bg-card px-4 py-2 text-muted-foreground">
              {language}
            </span>
          ))}
        </div>
      </Section>

      <footer id="contact" className="relative border-t border-border py-20 md:py-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Let&apos;s connect</p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Building useful AI for complex engineering work.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            I&apos;m always interested in thoughtful conversations about agentic systems, engineering
            digitization, and enterprise AI delivery.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:nvipin63@gmail.com"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground"
            >
              <Mail className="h-4 w-4" />
              nvipin63@gmail.com
            </a>
            <a
              href="https://www.linkedin.com/in/vipin-n"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 font-medium transition-colors hover:border-primary/50"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="mt-14 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Vipin Neekamparambath
          </p>
        </div>
      </footer>
    </main>
  )
}

export default App

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowUp, Bot, Loader2, Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { trackPortfolioEvent } from '../lib/analytics'

interface Citation {
  id: string
  title: string
  href: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

interface PortfolioChatProps {
  open: boolean
  onClose: () => void
}

const suggestions = [
  'What Agentic AI systems has Vipin built?',
  'What engineering domain experience does he bring?',
  'Why is he suited to an Agentic AI role?',
]

const MAX_QUESTIONS = 5

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return isMobile
}

export default function PortfolioChat({ open, onClose }: PortfolioChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "I'm Vipin's portfolio guide. I answer from the public CV and case studies, and I link every answer back to its source.",
    },
  ])
  const [input, setInput] = useState('')
  const [questionCount, setQuestionCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const isMobile = useIsMobile()
  const reduceMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusDelay = reduceMotion ? 0 : isMobile ? 280 : 180
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), focusDelay)

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKeyDown)
      returnFocusRef.current?.focus()
    }
  }, [isMobile, onClose, open, reduceMotion])

  useEffect(() => {
    if (!open || !isMobile) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const trapFocus = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], textarea:not([disabled])',
        ),
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', trapFocus)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', trapFocus)
    }
  }, [isMobile, open])

  useEffect(() => {
    const container = messagesRef.current
    if (open && container) container.scrollTop = container.scrollHeight
  }, [messages, open])

  async function ask(question: string) {
    const trimmed = question.trim()
    if (!trimmed || loading || questionCount >= MAX_QUESTIONS) return

    const nextCount = questionCount + 1
    const userMessage: ChatMessage = { role: 'user', content: trimmed }
    const history = [...messages, userMessage]

    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setQuestionCount(nextCount)
    setLoading(true)
    if (nextCount === 1) trackPortfolioEvent('chat_started')

    try {
      const response = await fetch('/api/portfolio-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history
            .filter((message) => message.content)
            .slice(-8)
            .map(({ role, content }) => ({ role, content })),
          currentPath: window.location.pathname,
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('The guide is temporarily unavailable.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''

        for (const eventBlock of events) {
          const eventName = eventBlock.match(/^event: (.+)$/m)?.[1]
          const dataLine = eventBlock.match(/^data: (.+)$/m)?.[1]
          if (!eventName || !dataLine) continue

          const data = JSON.parse(dataLine) as {
            text?: string
            citations?: Citation[]
            message?: string
          }

          if (eventName === 'text-delta' && data.text) {
            setMessages((current) => {
              const updated = [...current]
              const last = updated[updated.length - 1]
              if (last?.role === 'assistant') {
                updated[updated.length - 1] = { ...last, content: last.content + data.text }
              }
              return updated
            })
          }

          if (eventName === 'citations' && data.citations) {
            setMessages((current) => {
              const updated = [...current]
              const last = updated[updated.length - 1]
              if (last?.role === 'assistant') {
                updated[updated.length - 1] = { ...last, citations: data.citations }
              }
              return updated
            })
          }

          if (eventName === 'error') {
            throw new Error(data.message ?? 'The guide is temporarily unavailable.')
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The guide is temporarily unavailable.'
      setMessages((current) => {
        const updated = [...current]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant' && !last.content) {
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `${message} You can still explore the cited case studies or contact Vipin directly.`,
          }
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    void ask(input)
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void ask(input)
    }
  }

  const limitReached = questionCount >= MAX_QUESTIONS

  return (
    <div className="chat-shell" role="presentation">
      <AnimatePresence>
        {open && isMobile && (
          <motion.button
            key="chat-backdrop"
            type="button"
            tabIndex={-1}
            aria-label="Close portfolio guide"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-auto absolute inset-0 cursor-default bg-black/45 backdrop-blur-[2px]"
          />
        )}
        {open && (
          <motion.div
            key="chat-panel"
            id="portfolio-guide-dialog"
            ref={panelRef}
            role="dialog"
            aria-modal={isMobile || undefined}
            aria-labelledby="portfolio-guide-title"
            aria-describedby="portfolio-guide-description"
            initial={{
              opacity: 0,
              y: reduceMotion ? 0 : isMobile ? 28 : 20,
              scale: reduceMotion ? 1 : isMobile ? 0.985 : 0.94,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: reduceMotion ? 0 : isMobile ? 16 : 12,
              scale: reduceMotion ? 1 : 0.975,
              transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
            }}
            transition={{
              opacity: { duration: 0.18, ease: 'easeOut' },
              y: { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 },
              scale: { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 },
            }}
            className="chat-panel border border-border bg-background shadow-2xl shadow-black/30"
          >
        <header className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-3.5 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 id="portfolio-guide-title" className="font-display font-semibold">
                Ask Vipin&apos;s CV
              </h2>
              <p id="portfolio-guide-description" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                Answers with links to the evidence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
            aria-label="Close portfolio guide"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div
          ref={messagesRef}
          role="log"
          aria-live="off"
          aria-busy={loading}
          className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-5"
        >
          {messages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={message.role === 'user' ? 'ml-10' : 'mr-5'}
            >
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {message.role === 'user' ? 'You' : 'Portfolio guide'}
              </p>
              <div
                className={
                  message.role === 'user'
                    ? 'rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground'
                    : 'rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground'
                }
              >
                {message.content ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking the portfolio…
                  </span>
                )}
              </div>
              {message.citations && message.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.citations.map((citation) => (
                    <a
                      key={citation.id}
                      href={citation.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary hover:border-primary/50"
                    >
                      {citation.title}
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {loading ? 'Checking the portfolio.' : questionCount > 0 ? 'Answer ready.' : ''}
        </p>

        {questionCount === 0 && (
          <div className="border-t border-border px-4 py-3.5">
            <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Useful starting points
            </p>
            <div className="grid gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void ask(suggestion)}
                  className="min-h-11 rounded-xl border border-border bg-card px-3 py-2 text-left text-xs hover:border-primary/50 hover:bg-primary/5"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={submit} className="border-t border-border p-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-1.5 focus-within:border-primary/50">
            <label htmlFor="portfolio-question" className="sr-only">
              Ask about Vipin&apos;s experience
            </label>
            <textarea
              ref={inputRef}
              id="portfolio-question"
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              maxLength={500}
              disabled={loading || limitReached}
              placeholder={limitReached ? 'Question limit reached' : 'Ask about experience or projects…'}
              className="max-h-24 min-h-11 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || limitReached}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send question"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {questionCount}/{MAX_QUESTIONS} questions · no transcript storage · answers may be incomplete
          </p>
        </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

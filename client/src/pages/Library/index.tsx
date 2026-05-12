import { type FormEvent, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useLibraryTopics } from '@/hooks/useLibraryTopics'
import type {
  LibraryGraphMode,
  LibraryNoteSummary,
  LibraryTopic,
  LibraryViewMode,
} from '@/types'

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  content: string
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function createInitialThread(topic: LibraryTopic): ChatMessage[] {
  return [
    {
      id: `${topic.id}-intro`,
      role: 'assistant',
      content: `Let's make **${topic.title}** the focus. We can unpack the basic model, common misconceptions, and how to reason about it in the real world.`,
    },
    {
      id: `${topic.id}-guide`,
      role: 'assistant',
      content: `A useful way to learn this topic is to move from definitions into tradeoffs. Ask a question, test a scenario, or tell me what part still feels fuzzy.`,
    },
  ]
}

function buildAssistantReply(topic: LibraryTopic, prompt: string) {
  const cleanedPrompt = prompt.trim().replace(/\s+/g, ' ')
  return `For **${topic.title}**, I'd answer that by connecting the concept back to ${topic.description.toLowerCase()}. A strong next step would be to turn "${cleanedPrompt}" into a concrete example, compare two possible outcomes, and capture the takeaway as a note once the thread feels complete.`
}

function buildMockNotes(topics: LibraryTopic[]): Record<string, LibraryNoteSummary[]> {
  return Object.fromEntries(
    topics.map((topic, index) => {
      const notes: LibraryNoteSummary[] = [
        {
          id: `${topic.id}-primer`,
          topicId: topic.id,
          title: `${topic.title} primer`,
          excerpt: `A concise framing of ${topic.title.toLowerCase()} with the main mental models worth keeping close.`,
          createdAt: new Date(2026, 4, 2 + index).toISOString(),
          readTime: '4 min',
          tags: [topic.category, 'Core idea'],
          body: `## What this topic is really about

${topic.title} becomes easier to reason about when we anchor it to a simple question: **what decision is this concept helping me make better?**

### Working definition

${topic.description}

### Signals to watch

- Separate the core mechanism from market noise or headlines.
- Ask what tradeoff this concept introduces, not just what it promises.
- Translate the idea into one practical example before moving on.

### Takeaway

The goal is not memorizing jargon. It is building a repeatable lens for evaluating similar situations later.`,
        },
        {
          id: `${topic.id}-questions`,
          topicId: topic.id,
          title: `Questions to pressure-test ${topic.title.toLowerCase()}`,
          excerpt: `A reusable checklist of prompts to turn a broad topic into sharper conversations and better notes.`,
          createdAt: new Date(2026, 4, 7 + index).toISOString(),
          readTime: '6 min',
          tags: ['Prompts', 'Study guide'],
          body: `## Questions worth asking

When reviewing **${topic.title}**, these prompts tend to surface the most useful insights:

1. What assumption does this concept depend on?
2. What happens when the environment changes or becomes less favorable?
3. Which beginner mistake shows up most often here?
4. What metric or signal would I revisit before acting on this idea?

### Why this matters

Good notes are less about recording everything and more about preserving the questions that unlock better thinking the next time around.`,
        },
        {
          id: `${topic.id}-summary`,
          topicId: topic.id,
          title: `${topic.title} summary snapshot`,
          excerpt: `A mock end-of-session summary showing how conversation takeaways could later be saved as files.`,
          createdAt: new Date(2026, 4, 12 + index).toISOString(),
          readTime: '3 min',
          tags: ['Session summary', 'Mock note'],
          body: `## Session summary

We treated **${topic.title}** as the primary lens and focused on three ideas:

- the base concept and how to explain it simply
- the tradeoffs hidden underneath the surface
- the practical question to revisit before making a decision

### Key takeaway

For now, this note is mocked on the frontend. Later, this is where a concise summary of a real chat session would be saved automatically when the topic changes or the page is left.`,
        },
      ]

      return [topic.id, notes]
    }),
  )
}

export default function Library() {
  const { topics, isLoading, error, refreshTopics } = useLibraryTopics()
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<LibraryViewMode>('chat')
  const [graphMode, setGraphMode] = useState<LibraryGraphMode>('files')
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [chatDraft, setChatDraft] = useState('')
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({})
  const notesByTopic = useMemo(() => buildMockNotes(topics), [topics])

  useEffect(() => {
    if (topics.length === 0) {
      setActiveTopicId(null)
      return
    }

    setActiveTopicId((currentTopicId) => {
      if (currentTopicId && topics.some((topic) => topic.id === currentTopicId)) {
        return currentTopicId
      }

      return topics[0].id
    })

    setThreads((currentThreads) => {
      const nextThreads = { ...currentThreads }
      let changed = false

      for (const topic of topics) {
        if (!nextThreads[topic.id]) {
          nextThreads[topic.id] = createInitialThread(topic)
          changed = true
        }
      }

      return changed ? nextThreads : currentThreads
    })
  }, [topics])

  const activeTopic = topics.find((topic) => topic.id === activeTopicId) ?? null
  const activeNotes = activeTopic ? notesByTopic[activeTopic.id] ?? [] : []
  const activeThread = activeTopic ? threads[activeTopic.id] ?? [] : []
  const activeNote = activeNotes.find((note) => note.id === activeNoteId) ?? null

  function handleSelectTopic(topicId: string) {
    setActiveTopicId(topicId)
    setViewMode('chat')
    setActiveNoteId(null)
  }

  function handleOpenNotes(topicId: string) {
    setActiveTopicId(topicId)
    setViewMode('files')
    setGraphMode('files')
    setActiveNoteId(null)
  }

  function handleOpenNote(noteId: string) {
    setActiveNoteId(noteId)
    setViewMode('reader')
  }

  function handleReturnToFiles() {
    setViewMode('files')
    setGraphMode('files')
    setActiveNoteId(null)
  }

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeTopic || !chatDraft.trim()) return

    const prompt = chatDraft.trim()
    const userMessage: ChatMessage = {
      id: `${activeTopic.id}-${Date.now()}-user`,
      role: 'user',
      content: prompt,
    }
    const assistantMessage: ChatMessage = {
      id: `${activeTopic.id}-${Date.now()}-assistant`,
      role: 'assistant',
      content: buildAssistantReply(activeTopic, prompt),
    }

    setThreads((currentThreads) => ({
      ...currentThreads,
      [activeTopic.id]: [...(currentThreads[activeTopic.id] ?? []), userMessage, assistantMessage],
    }))
    setChatDraft('')
  }

  return (
    <div className="flex min-h-[calc(100vh-5.5rem)] flex-col gap-4">
      <header className="shrink-0">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-300/70">Reading Room</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Library</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Explore core finance concepts, hold topic-focused conversations, and browse saved takeaways in a
              library-shaped workspace.
            </p>
          </div>
          <div className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-amber-100/80">
            Frontend mock flow
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <aside className="flex min-h-[320px] flex-col overflow-hidden rounded-[1.5rem] border border-border bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.12),_transparent_36%),linear-gradient(180deg,rgba(22,27,39,0.96),rgba(18,22,32,0.98))] lg:col-span-4 lg:min-h-0">
          <div className="border-b border-border/80 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Core concepts</p>
                <p className="mt-1 text-sm text-slate-400">Single-click to focus a topic. Open notes when you want the saved summaries view.</p>
              </div>
              <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-slate-400">
                {topics.length} topics
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-border/70 bg-surface-2/80 px-4 py-4 animate-pulse"
                  >
                    <div className="h-4 w-32 rounded bg-surface-3" />
                    <div className="mt-3 h-3 w-full rounded bg-surface-3/80" />
                    <div className="mt-2 h-3 w-4/5 rounded bg-surface-3/70" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-900/40 bg-red-950/20 px-4 py-4">
                <p className="text-sm font-medium text-red-200">Could not load the concept shelf</p>
                <p className="mt-1 text-xs text-slate-400">{error}</p>
                <button
                  type="button"
                  onClick={refreshTopics}
                  className="mt-4 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-surface-3"
                >
                  Try again
                </button>
              </div>
            ) : topics.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-surface-2/50 px-5 text-center">
                <p className="text-sm font-medium text-slate-300">No concepts yet</p>
                <p className="mt-2 text-xs text-slate-500">Once topics exist, they will appear here as the core bookshelf for the Library.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topics.map((topic) => {
                  const isActive = topic.id === activeTopicId

                  return (
                    <div
                      key={topic.id}
                      className={clsx(
                        'group rounded-2xl border transition-all duration-200',
                        isActive
                          ? 'border-amber-300/30 bg-amber-500/10 shadow-[0_16px_40px_rgba(15,17,23,0.38)]'
                          : 'border-border/80 bg-surface-2/90 hover:border-slate-500/60 hover:bg-surface-3/55',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectTopic(topic.id)}
                        onDoubleClick={() => handleOpenNotes(topic.id)}
                        aria-pressed={isActive}
                        className="w-full rounded-t-2xl px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
                      >
                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{topic.category}</p>
                              <h2 className={clsx('mt-1 text-base font-semibold tracking-tight', isActive ? 'text-white' : 'text-slate-200')}>
                                {topic.title}
                              </h2>
                            </div>
                            {isActive ? (
                              <span className="shrink-0 rounded-full border border-amber-300/25 bg-amber-100/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-100/80">
                                Focused
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{topic.description}</p>
                        </div>
                      </button>

                      <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Double-click opens saved notes</p>
                        <button
                          type="button"
                          onClick={() => handleOpenNotes(topic.id)}
                          className={clsx(
                            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/60',
                            isActive
                              ? 'border-amber-300/25 bg-amber-100/10 text-amber-100 hover:bg-amber-100/15'
                              : 'border-border bg-surface-1 text-slate-300 hover:bg-surface-3',
                          )}
                        >
                          Open notes
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-[1.75rem] border border-border bg-[linear-gradient(180deg,rgba(22,27,39,0.98),rgba(15,17,23,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.26)] lg:col-span-8 lg:min-h-0">
          <div className="border-b border-border/80 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Workspace</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                  {activeTopic ? activeTopic.title : 'Select a concept'}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-400">
                  {activeTopic
                    ? activeTopic.description
                    : 'Choose a concept from the left rail to begin a conversation or browse saved notes.'}
                </p>
              </div>

              {activeTopic ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    {activeTopic.category}
                  </span>
                  {viewMode === 'chat' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenNotes(activeTopic.id)}
                      className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-surface-3"
                    >
                      View saved notes
                    </button>
                  ) : null}
                  {viewMode === 'reader' ? (
                    <button
                      type="button"
                      onClick={handleReturnToFiles}
                      className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-surface-3"
                    >
                      Back to notes
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="min-h-0 flex-1 p-4 sm:p-5">
            {!activeTopic && !isLoading ? (
              <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-surface-2/40 px-6 text-center">
                <div>
                  <p className="text-sm font-medium text-slate-300">Nothing selected yet</p>
                  <p className="mt-2 text-xs text-slate-500">Choose a concept from the bookshelf to enter the Library workspace.</p>
                </div>
              </div>
            ) : viewMode === 'files' && activeTopic ? (
              <div className="flex h-full min-h-0 flex-col rounded-[1.5rem] border border-border bg-surface-1/60">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Saved summaries</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Notes captured for {activeTopic.title}. These are frontend mock files for the first layout pass.
                    </p>
                  </div>

                  <div className="inline-flex rounded-full border border-border bg-surface-2 p-1">
                    {(['files', 'graph'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setGraphMode(mode)}
                        className={clsx(
                          'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                          graphMode === mode
                            ? 'bg-amber-100/10 text-amber-100'
                            : 'text-slate-400 hover:text-slate-200',
                        )}
                      >
                        {mode === 'files' ? 'Files' : 'Knowledge Graph'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-0 flex-1 p-4">
                  {graphMode === 'graph' ? (
                    <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-amber-300/20 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_45%),rgba(15,17,23,0.65)] px-6 text-center">
                      <div className="flex gap-3">
                        <span className="h-3 w-3 rounded-full bg-amber-300/70" />
                        <span className="h-3 w-3 rounded-full bg-slate-500" />
                        <span className="h-3 w-3 rounded-full bg-slate-600" />
                      </div>
                      <p className="mt-5 text-sm font-medium text-slate-200">Knowledge graph reserved</p>
                      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                        This mode is intentionally held as a polished placeholder for future graph relationships between notes,
                        recurring ideas, and concept clusters.
                      </p>
                    </div>
                  ) : activeNotes.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-[1.25rem] border border-dashed border-border bg-surface-2/40 px-6 text-center">
                      <div>
                        <p className="text-sm font-medium text-slate-300">No saved notes yet</p>
                        <p className="mt-2 text-xs text-slate-500">
                          Once conversations are summarized, they will appear here as concept-specific files.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid min-h-0 gap-3 md:grid-cols-2">
                      {activeNotes.map((note) => (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => handleOpenNote(note.id)}
                          className="rounded-[1.25rem] border border-border bg-surface-2/70 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/25 hover:bg-surface-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{formatDate(note.createdAt)}</p>
                              <h3 className="mt-2 text-base font-semibold tracking-tight text-white">{note.title}</h3>
                            </div>
                            <span className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">
                              {note.readTime}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-400">{note.excerpt}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {note.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-surface-1 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : viewMode === 'reader' && activeTopic && activeNote ? (
              <div className="flex h-full min-h-0 flex-col rounded-[1.5rem] border border-border bg-surface-1/60">
                <div className="border-b border-border/80 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
                    {activeTopic.title} / saved note
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-white">{activeNote.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {formatDate(activeNote.createdAt)} · {activeNote.readTime}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleReturnToFiles}
                      className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-surface-3"
                    >
                      Return to files
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {activeNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ children, ...props }) => (
                        <h2 className="mt-6 text-lg font-semibold tracking-tight text-white first:mt-0" {...props}>
                          {children}
                        </h2>
                      ),
                      h3: ({ children, ...props }) => (
                        <h3 className="mt-5 text-base font-semibold tracking-tight text-slate-100" {...props}>
                          {children}
                        </h3>
                      ),
                      p: ({ children, ...props }) => (
                        <p className="mt-3 text-sm leading-7 text-slate-300 first:mt-0" {...props}>
                          {children}
                        </p>
                      ),
                      ul: ({ children, ...props }) => (
                        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-300" {...props}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children, ...props }) => (
                        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-300" {...props}>
                          {children}
                        </ol>
                      ),
                      strong: ({ children, ...props }) => (
                        <strong className="font-semibold text-white" {...props}>
                          {children}
                        </strong>
                      ),
                      code: ({ children, className, ...props }) => (
                        <code className={clsx('rounded bg-surface-2 px-1.5 py-0.5 text-xs text-amber-100', className)} {...props}>
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {activeNote.body}
                  </ReactMarkdown>
                </div>
              </div>
            ) : activeTopic ? (
              <div className="flex h-full min-h-0 flex-col rounded-[1.5rem] border border-border bg-[linear-gradient(180deg,rgba(30,37,53,0.72),rgba(22,27,39,0.78))]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Topic conversation</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Keep the discussion centered on {activeTopic.title}. Saved summaries later live in the notes explorer.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-amber-300/20 bg-amber-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-100/85">
                      Chat-focused
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenNotes(activeTopic.id)}
                      className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-surface-3"
                    >
                      Open saved notes
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                  <div className="space-y-3">
                    {activeThread.map((message) => (
                      <div
                        key={message.id}
                        className={clsx(
                          'max-w-2xl rounded-2xl border px-4 py-3 shadow-sm',
                          message.role === 'assistant'
                            ? 'border-border bg-surface-2/85 text-slate-200'
                            : 'ml-auto border-amber-300/25 bg-amber-500/10 text-amber-50',
                        )}
                      >
                        <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                          {message.role === 'assistant' ? 'Library guide' : 'You'}
                        </p>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children, ...props }) => (
                              <p className="text-sm leading-6 text-inherit" {...props}>
                                {children}
                              </p>
                            ),
                            strong: ({ children, ...props }) => (
                              <strong className="font-semibold text-white" {...props}>
                                {children}
                              </strong>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/80 px-4 py-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface-1/70 px-4 py-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Summary lane</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Future backend work can save concise end-of-session takeaways here automatically.
                      </p>
                    </div>
                    <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      Placeholder
                    </span>
                  </div>

                  <form onSubmit={handleSendMessage} className="rounded-[1.25rem] border border-border bg-surface-1/70 p-3">
                    <label htmlFor="library-chat-draft" className="sr-only">
                      Ask a question about the active concept
                    </label>
                    <textarea
                      id="library-chat-draft"
                      value={chatDraft}
                      onChange={(event) => setChatDraft(event.target.value)}
                      rows={4}
                      placeholder={`Ask about ${activeTopic.title}, pressure-test a scenario, or turn a question into a saved takeaway...`}
                      className="w-full resize-none border-0 bg-transparent text-sm leading-6 text-slate-200 placeholder:text-slate-500 focus:outline-none"
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
                      <p className="text-xs text-slate-500">This composer is frontend-only for now and returns mocked guide responses.</p>
                      <button
                        type="submit"
                        disabled={!chatDraft.trim()}
                        className="rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-surface-2/40 px-6 text-center">
                <p className="text-sm text-slate-500">Preparing the workspace...</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

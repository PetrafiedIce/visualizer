import { useCallback, useEffect, useRef, useState } from 'react'
import { filterUnsafeContent, generateAssistantReply, type ChatMessage } from './ai'

function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore */
    }
  }, [key, value])
  return [value, setValue] as const
}

export default function GameApp() {
  const [ageConfirmed, setAgeConfirmed] = usePersistentState<boolean>('romance.ageConfirmed', false)
  const [suggestiveEnabled, setSuggestiveEnabled] = usePersistentState<boolean>('romance.suggestiveEnabled', false)
  const [messages, setMessages] = usePersistentState<ChatMessage[]>('romance.chat', [])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isThinking])

  const send = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isThinking) return

    const id = crypto.randomUUID()
    const userMsg: ChatMessage = { id, role: 'user', text: trimmed }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsThinking(true)

    // Simulate latency
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 400))

    const replyText = generateAssistantReply([...messages, userMsg], suggestiveEnabled)
    const { safeText, blocked } = filterUnsafeContent(replyText)

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: blocked ? `${safeText} (filtered)` : safeText,
    }
    setMessages((prev) => [...prev, assistantMsg])
    setIsThinking(false)
  }, [input, isThinking, messages, suggestiveEnabled, setMessages])

  const clearChat = useCallback(() => setMessages([]), [setMessages])

  if (!ageConfirmed) {
    return (
      <div className="h-full w-full">
        <div className="absolute inset-0" style={{ background: '#070a12' }} />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
          <div className="pointer-events-auto glass w-full max-w-3xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-neon-pink animate-pulse" />
                <div className="text-xs md:text-sm text-white/70">Mature themes. 18+ only. No explicit content.</div>
              </div>
              <a className="text-xs md:text-sm text-white/70 hover:text-white underline" href="/">Back to spectrum</a>
            </div>

            <div className="mt-4">
              <div className="text-lg md:text-xl font-semibold">Are you 18 or older?</div>
              <div className="mt-2 text-white/70 text-sm">By continuing you confirm you are at least 18 years old and agree to view content with mature themes.</div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="btn-primary" onClick={() => setAgeConfirmed(true)}>I am 18+ and agree</button>
                <button
                  className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white hover:bg-white/15 transition"
                  onClick={() => window.location.assign('/')}
                >
                  No, take me back
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-3 left-3 text-white/60 text-xs md:text-sm">
          <span className="font-semibold text-white/80">evening-cafe</span> · mature chat
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, #0b0f1a 0%, #1b1f3a 50%, #0b0f1a 100%)' }} />

      <div className="pointer-events-none absolute inset-0 flex items-start justify-center p-4">
        <div className="pointer-events-auto glass w-full max-w-3xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-neon-pink animate-pulse" />
              <div className="text-xs md:text-sm text-white/70">Warm, flirty, non‑explicit chat. 18+ only.</div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs md:text-sm text-white/70">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                  checked={suggestiveEnabled}
                  onChange={(e) => setSuggestiveEnabled(e.target.checked)}
                />
                Suggestive mode
              </label>
              <button
                className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-white hover:bg-white/15 transition text-xs md:text-sm"
                onClick={clearChat}
              >
                Clear chat
              </button>
              <a className="text-xs md:text-sm text-white/70 hover:text-white underline" href="/">Back</a>
            </div>
          </div>

          <div ref={listRef} className="mt-4 h-[60vh] overflow-y-auto pr-1 space-y-3">
            {messages.length === 0 && (
              <div className="text-white/60 text-sm">Say hi to start a cozy conversation.</div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-neon-pink/20 border border-white/10' : 'bg-white/10 border border-white/10'}`}>{m.text}</div>
              </div>
            ))}
            {isThinking && (
              <div className="text-left">
                <div className="inline-flex items-center gap-2 text-white/60 text-sm">
                  <span className="inline-block h-2 w-2 rounded-full bg-neon-pink animate-pulse" />
                  typing…
                </div>
              </div>
            )}
          </div>

          <form
            className="mt-4 flex items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <input
              className="input flex-1"
              placeholder="Write something sweet (no explicit content)…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn-primary" type="submit" disabled={isThinking || input.trim().length === 0}>
              Send
            </button>
          </form>
        </div>
      </div>

      <div className="absolute top-3 left-3 text-white/60 text-xs md:text-sm">
        <span className="font-semibold text-white/80">evening-cafe</span> · mature chat
      </div>
    </div>
  )
}
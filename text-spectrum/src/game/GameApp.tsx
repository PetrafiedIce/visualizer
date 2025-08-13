import { useCallback, useEffect, useMemo, useState } from 'react'
import { initialStats, storyData, type SceneNode, type Stats } from './story'

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

function applyEffects(stats: Stats, effects?: Partial<Stats>): Stats {
  if (!effects) return stats
  return {
    ...stats,
    affection: Math.max(0, Math.min(5, (stats.affection ?? 0) + (effects.affection ?? 0))),
  }
}

export default function GameApp() {
  const [currentId, setCurrentId] = usePersistentState<string>('romance.currentId', 'intro')
  const [stats, setStats] = usePersistentState<Stats>('romance.stats', initialStats)
  const [ageConfirmed, setAgeConfirmed] = usePersistentState<boolean>('romance.ageConfirmed', false)
  const [suggestiveEnabled, setSuggestiveEnabled] = usePersistentState<boolean>('romance.suggestiveEnabled', false)

  const node: SceneNode | undefined = useMemo(() => storyData[currentId], [currentId])

  const proceed = useCallback((nextId?: string) => {
    if (!nextId) return
    setCurrentId(nextId)
  }, [setCurrentId])

  const choose = useCallback((choiceId: string) => {
    if (!node || !node.choices) return
    const choice = node.choices.find((c) => c.id === choiceId)
    if (!choice) return

    if (typeof choice.minAffection === 'number' && stats.affection < choice.minAffection) {
      setCurrentId('goodnightScene')
      return
    }

    setStats((prev) => applyEffects(prev, choice.effects))
    setCurrentId(choice.next)
  }, [node, setStats, stats.affection, setCurrentId])

  const reset = useCallback(() => {
    setStats(initialStats)
    setCurrentId('intro')
  }, [setStats, setCurrentId])

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
          <span className="font-semibold text-white/80">evening-cafe</span> · dating sim
        </div>
      </div>
    )
  }

  if (!node) {
    return (
      <div className="h-full w-full grid place-items-center">
        <div className="glass rounded-2xl p-6 max-w-xl w-full text-center">
          <div className="text-white/70 mb-4">Story node not found.</div>
          <button className="btn-primary" onClick={() => reset()}>Restart</button>
        </div>
      </div>
    )
  }

  const isEnding = !node.next && !node.choices
  const displayText = suggestiveEnabled && node.textSuggestive ? node.textSuggestive : node.text

  return (
    <div className="h-full w-full">
      <div className="absolute inset-0" style={{ background: node.background || '#070a12' }} />

      <div className="pointer-events-none absolute inset-0 flex items-start justify-center p-4">
        <div className="pointer-events-auto glass w-full max-w-3xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-neon-pink animate-pulse" />
              <div className="text-xs md:text-sm text-white/70">A cozy, mature romance. No explicit content.</div>
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
              <a className="text-xs md:text-sm text-white/70 hover:text-white underline" href="/">Back</a>
            </div>
          </div>

          {node.warning && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs md:text-sm text-white/80">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-semibold">Content note:</span> {node.warning}
                </div>
                {node.skippableTo && (
                  <button
                    className="inline-flex items-center justify-center rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white hover:bg-white/15 transition"
                    onClick={() => proceed(node.skippableTo)}
                  >
                    Skip scene
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-5">
            {node.speaker && (
              <div className="text-white/70 text-xs">{node.speaker}</div>
            )}
            <div className="mt-1 text-lg md:text-xl leading-relaxed">{displayText}</div>
          </div>

          {node.choices && (
            <div className="mt-5 grid gap-3">
              {node.choices.map((c) => {
                const label = suggestiveEnabled && c.textSuggestive ? c.textSuggestive : c.text
                return (
                  <button key={c.id} className="btn-primary justify-self-start" onClick={() => choose(c.id)}>
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          {!node.choices && node.next && (
            <div className="mt-5">
              <button className="btn-primary" onClick={() => proceed(node.next)}>Continue</button>
            </div>
          )}

          {isEnding && (
            <div className="mt-6 flex items-center gap-3">
              <button className="btn-primary" onClick={reset}>Play again</button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-3 left-3 text-white/60 text-xs md:text-sm">
        <span className="font-semibold text-white/80">evening-cafe</span> · dating sim
      </div>
    </div>
  )
}
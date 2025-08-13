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
      // If affection is too low, gently redirect
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

  return (
    <div className="h-full w-full">
      <div className="absolute inset-0" style={{ background: node.background || '#070a12' }} />

      <div className="pointer-events-none absolute inset-0 flex items-start justify-center p-4">
        <div className="pointer-events-auto glass w-full max-w-3xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-neon-pink animate-pulse" />
              <div className="text-xs md:text-sm text-white/70">A cozy, choice-driven romance. No explicit content.</div>
            </div>
            <a className="text-xs md:text-sm text-white/70 hover:text-white underline" href="/">Back to spectrum</a>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-white/70">Affection</div>
            <div className="flex gap-1" aria-label="Affection meter">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={"inline-block h-2 w-6 rounded-full " + (i < stats.affection ? 'bg-neon-pink' : 'bg-white/15')} />
              ))}
            </div>
          </div>

          <div className="mt-5">
            {node.speaker && (
              <div className="text-white/70 text-xs">{node.speaker}</div>
            )}
            <div className="mt-1 text-lg md:text-xl leading-relaxed">{node.text}</div>
          </div>

          {node.choices && (
            <div className="mt-5 grid gap-3">
              {node.choices.map((c) => (
                <button key={c.id} className="btn-primary justify-self-start" onClick={() => choose(c.id)}>
                  {c.text}
                </button>
              ))}
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
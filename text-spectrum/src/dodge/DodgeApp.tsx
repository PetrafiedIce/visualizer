import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'

const DodgeScene = lazy(() => import('./DodgeScene'))

export default function DodgeApp() {
  const GAME_DURATION_SECONDS = 60

  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS)
  const [score, setScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)

  useEffect(() => {
    if (!isPlaying) return
    setTimeLeft(GAME_DURATION_SECONDS)
    setScore(0)
    setIsGameOver(false)
  }, [isPlaying])

  useEffect(() => {
    if (!isPlaying) return
    if (timeLeft <= 0) {
      setIsPlaying(false)
      return
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [isPlaying, timeLeft])

  const handleDodge = useCallback(() => setScore((s) => s + 1), [])
  const handleHit = useCallback(() => {
    setIsGameOver(true)
    setIsPlaying(false)
  }, [])

  const cta = useMemo(() => (isPlaying ? 'Good luck!' : score > 0 || isGameOver ? 'Play again' : 'Start'), [isPlaying, score, isGameOver])

  return (
    <div className="h-full w-full">
      <div className="absolute inset-0">
        <Suspense fallback={<div className="absolute inset-0 grid place-items-center text-white/60">Loading game…</div>}>
          <DodgeScene isPlaying={isPlaying} onDodge={handleDodge} onHit={handleHit} />
        </Suspense>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-start justify-center p-4">
        <div className="pointer-events-auto glass w-full max-w-3xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-2 w-2 rounded-full bg-neon-pink animate-pulse" />
              <div className="text-xs md:text-sm text-white/70">Move with A/D or arrows. Dodge the neon blocks.</div>
            </div>
            <div className="flex items-center gap-3 text-xs md:text-sm text-white/70">
              <a className="hover:text-white underline" href="/">Back to spectrum</a>
              <span>·</span>
              <a className="hover:text-white underline" href="/game.html">Orb Collector</a>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 items-center gap-3">
            <div className="text-center">
              <div className="text-white/70 text-xs md:text-sm">Time</div>
              <div className="text-2xl md:text-3xl font-semibold">{timeLeft}s</div>
            </div>
            <button
              className="btn-primary justify-self-center text-base md:text-lg"
              onClick={() => setIsPlaying((p) => !p)}
            >
              {isPlaying ? 'Pause' : cta}
            </button>
            <div className="text-center">
              <div className="text-white/70 text-xs md:text-sm">Dodged</div>
              <div className="text-2xl md:text-3xl font-semibold">{score}</div>
            </div>
          </div>

          {isGameOver && (
            <div className="mt-3 text-center text-white/80 text-sm md:text-base">
              Game over — you were hit! Press "{cta}" to try again.
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-3 left-3 text-white/60 text-xs md:text-sm">
        <span className="font-semibold text-white/80">neon-dodge</span> · react-three-fiber
      </div>
    </div>
  )
}
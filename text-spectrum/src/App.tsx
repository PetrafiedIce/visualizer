import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import './index.css'

const Scene = lazy(() => import('./Scene'))

function App() {
  const initialText = useMemo(() => {
    const fromHash = decodeURIComponent(window.location.hash.slice(1) || '')
    return fromHash || 'Type to create a spectrum'
  }, [])

  const [text, setText] = useState(initialText)

  useEffect(() => {
    const encoded = '#' + encodeURIComponent(text)
    window.history.replaceState(null, '', encoded)
  }, [text])

  return (
    <div className="h-full w-full">
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="absolute inset-0 grid place-items-center text-white/60">Loading 3D scene…</div>
          }
        >
          <Scene text={text} />
        </Suspense>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-end md:items-center justify-center p-4">
        <div className="pointer-events-auto glass w-full max-w-3xl rounded-2xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch">
            <label htmlFor="text-input" className="sr-only">Text to visualize</label>
            <input
              id="text-input"
              className="input flex-1 text-lg md:text-xl"
              placeholder="Type anything... emojis, symbols, poetry, code"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Text to visualize"
            />
            <button
              className="btn-primary whitespace-nowrap text-base md:text-lg"
              onClick={() => setText('')}
            >
              Clear
            </button>
          </div>
          <div className="mt-3 text-xs md:text-sm text-white/70 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-neon-pink animate-pulse" />
            Live 3D spectrum. Drag to orbit.
          </div>
        </div>
      </div>

      <div className="absolute top-3 left-3 text-white/60 text-xs md:text-sm">
        <span className="font-semibold text-white/80">text-spectrum</span> · react-three-fiber
      </div>
    </div>
  )
}

export default App

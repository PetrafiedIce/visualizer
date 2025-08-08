# Text Spectrum

Type anything and watch a live 3D color spectrum emerge. Built with React, Vite, Tailwind CSS, and React Three Fiber.

## Features
- Live 3D visualization of your text
- Neon glass UI with Tailwind CSS
- High‑quality postprocessing (bloom, chromatic aberration, vignette)
- Orbit controls (drag to rotate)
- URL hash persistence: share your spectrum via the URL
- Code‑split heavy 3D bundle for faster initial load

## Tech stack
- React 19 + TypeScript
- Vite 7
- Tailwind CSS 3
- three.js + @react-three/fiber + drei + postprocessing
- ESLint (recommended rules)

## Getting started
```bash
npm ci
npm run dev
```

- Dev server runs on localhost (container/cloud friendly).
- Open the app and start typing. Drag the canvas to orbit the camera.

## Scripts
- `npm run dev`: Start dev server
- `npm run lint`: Lint all files
- `npm run build`: Type-check and build for production
- `npm run preview`: Preview the production build

## Performance
- Heavy three.js and R3F dependencies are lazy‑loaded and split into a separate chunk via Vite `manualChunks`.
- You can tune chunking in `vite.config.ts`.

## Deployment
The app is a static build. Any static host works:
```bash
npm run build
# Deploy the contents of dist/ to your host
```

## License
MIT — see `../LICENSE`.

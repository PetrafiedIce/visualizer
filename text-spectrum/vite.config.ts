import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { host: true },
  preview: { host: true },
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        game: resolve(rootDir, 'game.html'),
        dodge: resolve(rootDir, 'dodge.html'),
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'postprocessing'],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
})

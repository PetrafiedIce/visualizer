/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx,html}'
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0b0f1a',
        neon: {
          pink: '#ff2d95',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          cyan: '#22d3ee',
        },
      },
    },
  },
  plugins: [],
}


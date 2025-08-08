import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import DodgeApp from './DodgeApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DodgeApp />
  </StrictMode>,
)
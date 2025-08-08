import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkBase = 'px-3 py-2 rounded-lg transition-colors'
  return (
    <div className="pointer-events-auto glass fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl rounded-2xl">
      <div className="flex items-center justify-between px-4 py-3">
        <NavLink to="/" className="font-semibold tracking-tight text-white">
          <span className="text-neon-pink">text</span>
          <span className="text-white/80">-</span>
          <span className="text-neon-blue">spectrum</span>
        </NavLink>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}>Spectrum</NavLink>
          <NavLink to="/particles" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}>Particles</NavLink>
          <NavLink to="/grid" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}>Neon Grid</NavLink>
          <NavLink to="/orbs" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}>Orbs</NavLink>
        </nav>
      </div>
    </div>
  )
}
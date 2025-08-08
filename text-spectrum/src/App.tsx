import './index.css'
import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import TextSpectrum from './pages/TextSpectrum'
import Particles from './pages/Particles'
import NeonGrid from './pages/NeonGrid'
import Orbs from './pages/Orbs'

function Layout() {
  return (
    <div className="h-full w-full">
      <Navbar />
      <div className="h-full w-full">
        <Outlet />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TextSpectrum />} />
        <Route path="/particles" element={<Particles />} />
        <Route path="/grid" element={<NeonGrid />} />
        <Route path="/orbs" element={<Orbs />} />
      </Route>
    </Routes>
  )
}

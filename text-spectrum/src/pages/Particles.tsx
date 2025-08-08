import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Points, PointMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, Glitch } from '@react-three/postprocessing'
import * as THREE from 'three'

function Swarm({ count = 3000 }) {
  const ref = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2.5 * Math.cbrt(Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      arr.set([x, y, z], i * 3)
    }
    return arr
  }, [count])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (!ref.current) return
    ref.current.rotation.y = t * 0.08
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.2
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#22d3ee"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  )
}

export default function Particles() {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={["#070a12"]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 3, 5]} intensity={0.8} color="#8b5cf6" />
        <pointLight position={[-5, -3, -5]} intensity={0.8} color="#22d3ee" />
        <Environment preset="city" />

        <Swarm />

        <OrbitControls enablePan={false} minDistance={3} maxDistance={20} />
        <EffectComposer>
          <Bloom intensity={1.1} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
          <Glitch delay={new THREE.Vector2(1.5, 3.5)} duration={new THREE.Vector2(0.4, 0.7)} strength={new THREE.Vector2(0.02, 0.04)} />
        </EffectComposer>
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-xl px-4 py-2 text-xs text-white/80">
        Neon particle swarm. Drag to orbit.
      </div>
    </div>
  )
}
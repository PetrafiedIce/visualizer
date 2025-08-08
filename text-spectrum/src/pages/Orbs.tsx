import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'

function Orb({ color = '#8b5cf6', radius = 2, speed = 0.6, offset = 0 }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + offset
    const x = Math.cos(t) * radius
    const z = Math.sin(t) * radius
    const y = Math.sin(t * 1.3) * 0.8
    if (ref.current) {
      ref.current.position.set(x, y, z)
    }
  })
  const emissive = useMemo(() => new THREE.Color(color), [color])
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.5} metalness={0.2} roughness={0.3} />
    </mesh>
  )
}

export default function Orbs() {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 1.5, 7], fov: 55 }} dpr={[1, 2]}>
        <color attach="background" args={["#070a12"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 6, 2]} intensity={1.2} color="#22d3ee" />
        <Environment preset="city" />

        <group>
          <Orb color="#22d3ee" radius={3.2} speed={0.7} offset={0} />
          <Orb color="#ff2d95" radius={2.6} speed={0.9} offset={1} />
          <Orb color="#3b82f6" radius={3.8} speed={0.5} offset={2} />
        </group>

        <OrbitControls enablePan={false} minDistance={3} maxDistance={20} />

        <EffectComposer enableNormalPass={false}>
          <Bloom intensity={1.2} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
          <ChromaticAberration offset={[0.0018, 0.0012]} radialModulation modulationOffset={0.5} />
        </EffectComposer>
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-xl px-4 py-2 text-xs text-white/80">
        Floating neon orbs. Drag to orbit.
      </div>
    </div>
  )
}
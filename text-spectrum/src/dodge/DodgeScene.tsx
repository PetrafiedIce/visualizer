import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Text } from '@react-three/drei'
import * as THREE from 'three'

type DodgeSceneProps = {
  isPlaying: boolean
  onDodge: () => void
  onHit: () => void
}

function useLeftRightKeys() {
  const pressed = useRef<{ [key: string]: boolean }>({})
  useEffect(() => {
    const down = (e: KeyboardEvent) => (pressed.current[e.code] = true)
    const up = (e: KeyboardEvent) => (pressed.current[e.code] = false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])
  const getAxis = useCallback(() => {
    const left = pressed.current['ArrowLeft'] || pressed.current['KeyA']
    const right = pressed.current['ArrowRight'] || pressed.current['KeyD']
    return (right ? 1 : 0) - (left ? 1 : 0)
  }, [])
  return getAxis
}

function randomX(radius = 7) {
  return (Math.random() * 2 - 1) * radius
}

function Obstacles({ blocks }: { blocks: THREE.Vector3[] }) {
  return (
    <group>
      {blocks.map((pos, i) => (
        <mesh key={i} position={pos.toArray()}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  )
}

function DodgeCore({ isPlaying, onDodge, onHit }: DodgeSceneProps) {
  const playerRef = useRef<THREE.Mesh>(null)
  const getAxis = useLeftRightKeys()

  const [blocks, setBlocks] = useState<THREE.Vector3[]>(() => [])
  const bounds = useMemo(() => ({ x: 8, z: 8, top: 8, bottom: -8 }), [])
  const speed = 7
  const fallSpeed = 5
  const spawnInterval = 0.7
  const timeSinceSpawn = useRef(0)

  useFrame((_, delta) => {
    const player = playerRef.current
    if (!player) return

    if (isPlaying) {
      const axis = getAxis()
      player.position.x += axis * speed * delta
      player.position.x = THREE.MathUtils.clamp(player.position.x, -bounds.x, bounds.x)

      // Spawn blocks over time
      timeSinceSpawn.current += delta
      if (timeSinceSpawn.current >= spawnInterval) {
        timeSinceSpawn.current = 0
        setBlocks((prev) => {
          const next = prev.slice()
          next.push(new THREE.Vector3(randomX(bounds.x), bounds.top, 0))
          return next
        })
      }

      // Move blocks and detect collisions
      setBlocks((prev) => {
        const next: THREE.Vector3[] = []
        for (const b of prev) {
          b.y -= fallSpeed * delta
          const dx = (player.position.x - b.x)
          const dy = (player.position.y - b.y)
          const dz = (player.position.z - b.z)
          if (dx * dx + dy * dy + dz * dz < 0.9 * 0.9) {
            onHit()
            // Clear all to pause visuals a bit
            return []
          }
          if (b.y <= bounds.bottom) {
            onDodge()
          } else {
            next.push(b)
          }
        }
        return next
      })
    }
  })

  return (
    <>
      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40, 1, 1]} />
        <meshStandardMaterial color="#0b0f1a" />
      </mesh>

      {/* Lane markers */}
      <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[8.2, 8.3, 64]} />
        <meshBasicMaterial color="#f472b6" />
      </mesh>

      {/* Player */}
      <mesh ref={playerRef} position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#ff2d95" emissive="#ff2d95" emissiveIntensity={0.6} />
      </mesh>

      {/* Obstacles */}
      <Obstacles blocks={blocks} />

      <Text position={[0, 0.05, 9]} fontSize={0.4} color="#ffffff" anchorX="center" anchorY="middle">
        Dodge the neon blocks!
      </Text>
    </>
  )
}

export default function DodgeScene({ isPlaying, onDodge, onHit }: DodgeSceneProps) {
  return (
    <Canvas camera={{ position: [0, 6.5, 8], fov: 50 }} dpr={[1, 2]} shadows>
      <color attach="background" args={["#070a12"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <Environment preset="city" />
      <DodgeCore isPlaying={isPlaying} onDodge={onDodge} onHit={onHit} />
    </Canvas>
  )
}
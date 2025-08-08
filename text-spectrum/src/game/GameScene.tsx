import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Text } from '@react-three/drei'
import * as THREE from 'three'

type GameSceneProps = {
  isPlaying: boolean
  onCollect: () => void
}

function useMovementKeys() {
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
  const getDirection = useCallback(() => {
    const forward = pressed.current['ArrowUp'] || pressed.current['KeyW']
    const backward = pressed.current['ArrowDown'] || pressed.current['KeyS']
    const left = pressed.current['ArrowLeft'] || pressed.current['KeyA']
    const right = pressed.current['ArrowRight'] || pressed.current['KeyD']
    const dir = new THREE.Vector3(
      (right ? 1 : 0) - (left ? 1 : 0),
      0,
      (backward ? 1 : 0) - (forward ? 1 : 0),
    )
    if (dir.lengthSq() > 0) dir.normalize()
    return dir
  }, [])
  return getDirection
}

type Orb = { id: number; position: [number, number, number] }

function randomPosition(radius = 7): [number, number, number] {
  const x = (Math.random() * 2 - 1) * radius
  const z = (Math.random() * 2 - 1) * radius
  const y = 0.5 + Math.random() * 0.5
  return [x, y, z]
}

function Orbs({ orbs }: { orbs: Orb[] }) {
  return (
    <group>
      {orbs.map((orb) => (
        <mesh key={orb.id} position={orb.position}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  )
}

function GameCore({ isPlaying, onCollect }: GameSceneProps) {
  const playerRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()
  const getDirection = useMovementKeys()

  const [orbs, setOrbs] = useState<Orb[]>(() => Array.from({ length: 12 }, (_, i) => ({ id: i, position: randomPosition() })))
  const bounds = useMemo(() => ({ x: 8, z: 8 }), [])
  const speed = 5

  const collectAtIndex = useCallback((idx: number) => {
    setOrbs((prev) => {
      const copy = prev.slice()
      const [removed] = copy.splice(idx, 1)
      void removed
      copy.push({ id: Date.now() + Math.floor(Math.random() * 1000), position: randomPosition() })
      return copy
    })
    onCollect()
  }, [onCollect])

  useFrame((_, delta) => {
    const player = playerRef.current
    if (!player) return

    // Move only while playing
    if (isPlaying) {
      const dir = getDirection()
      player.position.x += dir.x * speed * delta
      player.position.z += dir.z * speed * delta

      // Clamp to bounds
      player.position.x = THREE.MathUtils.clamp(player.position.x, -bounds.x, bounds.x)
      player.position.z = THREE.MathUtils.clamp(player.position.z, -bounds.z, bounds.z)

      // Collision check with orbs
      for (let i = 0; i < orbs.length; i++) {
        const [ox, oy, oz] = orbs[i].position
        const dx = player.position.x - ox
        const dz = player.position.z - oz
        const dy = (player.position.y + 0.5) - oy
        if (dx * dx + dy * dy + dz * dz < 0.6 * 0.6) {
          collectAtIndex(i)
          break
        }
      }
    }

    // Follow camera
    const target = new THREE.Vector3(player.position.x, player.position.y, player.position.z)
    const camPos = target.clone().add(new THREE.Vector3(0, 6.5, 8))
    camera.position.lerp(camPos, 0.1)
    camera.lookAt(target)
  })

  return (
    <>
      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40, 1, 1]} />
        <meshStandardMaterial color="#0b0f1a" />
      </mesh>

      {/* Bounds visual */}
      <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[8.2, 8.3, 64]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>

      {/* Player */}
      <mesh ref={playerRef} position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color="#ff2d95" emissive="#ff2d95" emissiveIntensity={0.6} />
      </mesh>

      {/* Orbs */}
      <Orbs orbs={orbs} />

      {/* Minimal HUD in 3D */}
      <Text position={[0, 0.05, 9]} fontSize={0.4} color="#ffffff" anchorX="center" anchorY="middle">
        Collect the orbs!
      </Text>
    </>
  )
}

export default function GameScene({ isPlaying, onCollect }: GameSceneProps) {
  return (
    <Canvas camera={{ position: [0, 6.5, 8], fov: 50 }} dpr={[1, 2]} shadows>
      <color attach="background" args={["#070a12"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <Environment preset="city" />
      <GameCore isPlaying={isPlaying} onCollect={onCollect} />
    </Canvas>
  )
}
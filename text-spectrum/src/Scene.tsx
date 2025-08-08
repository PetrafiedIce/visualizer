import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text, Environment, GradientTexture } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

function hashStringToNumber(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function stringToColor(input: string): THREE.Color {
  const hash = hashStringToNumber(input)
  const hue = hash % 360
  const saturation = 70
  const lightness = 55
  const color = new THREE.Color()
  color.setHSL(hue / 360, saturation / 100, lightness / 100)
  return color
}

function CharacterRibbon({ text }: { text: string }) {
  const characters = [...text]
  const baseColor = useMemo(() => stringToColor(text || ' '), [text])

  return (
    <group>
      {characters.map((char, index) => {
        const t = index / Math.max(1, characters.length - 1)
        const angle = t * Math.PI * 2
        const radius = 2.5 + Math.sin(t * Math.PI * 4) * 0.4
        const y = Math.cos(t * Math.PI * 2) * 0.4
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

        const color = baseColor.clone().lerp(new THREE.Color('#22d3ee'), t)
        const size = 0.5 + Math.sin(t * Math.PI) * 0.6

        return (
          <Text
            key={index}
            position={[x, y, z]}
            rotation={[0, -angle + Math.PI / 2, 0]}
            color={color.getStyle()}
            fontSize={size}
            anchorX="center"
            anchorY="middle"
            fontWeight={700}
            characters="\u0000-\uffff"
          >
            {char === ' ' ? '·' : char}
          </Text>
        )
      })}
    </group>
  )
}

function SpectrumField({ text }: { text: string }) {
  const points = useMemo(
    () => new THREE.IcosahedronGeometry(1.5, 3).attributes.position.array as ArrayLike<number>,
    [],
  )
  const colorA = useMemo(() => stringToColor(text || 'A').getStyle(), [text])
  const colorB = useMemo(
    () => stringToColor(text.split('').reverse().join('') || 'B').getStyle(),
    [text],
  )

  return (
    <mesh>
      <sphereGeometry args={[8, 64, 64]} />
      <meshBasicMaterial side={THREE.BackSide}>
        <GradientTexture stops={[0, 0.5, 1]} colors={[colorA, '#0b0f1a', colorB]} size={512} />
      </meshBasicMaterial>
      <group>
        {Array.from({ length: (points.length as number) / 3 }).map((_, i) => {
          const x = (points[i * 3] as number) * 2.5
          const y = (points[i * 3 + 1] as number) * 2.5
          const z = (points[i * 3 + 2] as number) * 2.5
          const c = new THREE.Color(colorA).lerp(new THREE.Color(colorB), (i % 30) / 30)
          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} />
            </mesh>
          )
        })}
      </group>
    </mesh>
  )
}

export default function Scene({ text }: { text: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
      <color attach="background" args={["#070a12"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <Environment preset="city" />

      <SpectrumField text={text} />
      <CharacterRibbon text={text} />

      <OrbitControls enablePan={false} minDistance={4} maxDistance={20} />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={1.2} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
        <ChromaticAberration offset={[0.0015, 0.001]} radialModulation modulationOffset={0.5} />
        <Vignette eskil={false} offset={0.2} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  )
}
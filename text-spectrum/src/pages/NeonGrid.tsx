import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export default function NeonGrid() {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [5, 4, 5], fov: 55 }} dpr={[1, 2]}>
        <color attach="background" args={["#070a12"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1.4} color="#3b82f6" />
        <Environment preset="city" />

        <Grid
          infiniteGrid
          cellSize={0.6}
          cellThickness={0.8}
          sectionSize={3}
          sectionThickness={1.2}
          followCamera={false}
          fadeDistance={45}
          fadeStrength={1}
          side={2}
          position={[0, -1.2, 0]}
          cellColor="#22d3ee"
          sectionColor="#ff2d95"
        />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}
          receiveShadow>
          <planeGeometry args={[100, 100, 1, 1]} />
        </mesh>

        <OrbitControls maxPolarAngle={Math.PI / 2.2} minDistance={3} maxDistance={30} />

        <EffectComposer enableNormalPass={false}>
          <Bloom intensity={1.1} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.55} />
        </EffectComposer>
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-xl px-4 py-2 text-xs text-white/80">
        Infinite neon grid. Drag to orbit.
      </div>
    </div>
  )
}
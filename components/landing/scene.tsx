"use client"

import { Canvas } from "@react-three/fiber"
import { Environment, Float } from "@react-three/drei"
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing"
import { Model } from "./model"
import { Suspense } from "react"

export function Scene() {
    return (
        <div className="fixed inset-0 w-full h-full z-[-1] pointer-events-none bg-black">
            <Canvas gl={{ antialias: false, powerPreference: "high-performance" }} dpr={[1, 1.25]} camera={{ position: [0, 0, 5], fov: 50 }}>
                {/* Lighting - Futuristic Vibe */}
                <ambientLight intensity={0.5} color="#4a00e0" />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#8e2de2" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#00d2ff" />

                {/* Fog for depth */}
                <fog attach="fog" args={['#050505', 5, 20]} />

                <Suspense fallback={null}>
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <Model scale={1.5} />
                    </Float>
                    <Environment preset="city" />
                </Suspense>

                <EffectComposer disableNormalPass>
                    <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.5} radius={0.5} />
                    <Noise opacity={0.02} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    {/* Simplified DepthOfField or removed it for better performance if needed, keeping it for now but optimizing composer */}
                </EffectComposer>
            </Canvas>

            {/* Background Gradient Overlay (CSS) to blend 3D with page */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />
        </div>
    )
}

"use client"

import { useGLTF } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

export function Model(props: any) {
    const { scene } = useGLTF("/model.glb")
    const modelRef = useRef<THREE.Group>(null)
    const { viewport } = useThree()

    useFrame((state) => {
        if (!modelRef.current) return

        // Calculate scroll progress (0 to 1)
        const scrollY = window.scrollY
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        const progress = Math.min(scrollY / maxScroll, 1)

        // Target values
        const targetRotationY = progress * Math.PI * 2
        const targetScale = 1 + progress * 0.1

        // Apply rotation
        modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, targetRotationY, 0.1)

        // Apply scale (preserving original scale from props if possible, but here we set it directly)
        // If props.scale is passed, we should respect it. 
        // But props are spread onto the group, so modelRef.current.scale is already set initially.
        // We should probably modify the scale relative to the base scale.
        // For simplicity, let's just use the calculated scale for now, but maybe boost it if it's too small.
        // The user passed scale={1.5} in Scene. 

        const baseScale = props.scale || 1.5
        const finalScale = baseScale * targetScale

        modelRef.current.scale.set(finalScale, finalScale, finalScale)
    })

    return (
        <group {...props} dispose={null} ref={modelRef}>
            <primitive object={scene} />
        </group>
    )
}

useGLTF.preload("/model.glb")

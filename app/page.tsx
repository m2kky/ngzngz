"use client"

import dynamic from "next/dynamic"
import { Overlay } from "@/components/landing/overlay"
import { BackToTop } from "@/components/ui/back-to-top"

// Lazy load the 3D scene with no SSR to unblock initial paint
const Scene = dynamic(() => import("@/components/landing/scene").then(mod => mod.Scene), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black -z-10" />
})

export default function Home() {
  return (
    <main className="relative min-h-screen text-white selection:bg-purple-500/30">
      <Scene />
      <Overlay />
      <BackToTop />
    </main>
  )
}

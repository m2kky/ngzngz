import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-purple-900/40 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-900/40 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-pink-900/20 blur-[100px] animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center gap-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-white/80 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>The Operating System for Gen Z Agencies</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 animate-fade-in-up delay-100 max-w-4xl">
          Manage Your Agency Like a Ninja
        </h1>

        <p className="text-lg md:text-xl text-white/60 max-w-2xl animate-fade-in-up delay-200">
          Streamline your workflow, manage squads, and scale your creative operations with the ultimate platform built for modern agencies.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
          <Link href="/auth">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 text-base font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
              Enter the Dojo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button variant="outline" size="lg" className="border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full px-8 h-12 text-base backdrop-blur-sm transition-all hover:scale-105">
              Book Demo
            </Button>
          </Link>
        </div>

        {/* 3D Dashboard Mockup */}
        <div className="mt-16 relative w-full max-w-5xl aspect-[16/9] perspective-1000 animate-fade-in-up delay-500">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-white/5 rounded-xl border border-white/10 backdrop-blur-md shadow-2xl transform rotate-x-12 scale-95 hover:scale-100 transition-transform duration-700 ease-out group overflow-hidden">
            {/* Mock UI Elements */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="p-8 grid grid-cols-3 gap-6 h-full pt-20">
              <div className="col-span-1 bg-white/5 rounded-lg border border-white/5 p-4 flex flex-col gap-4">
                <div className="h-8 w-24 bg-white/10 rounded" />
                <div className="h-32 w-full bg-white/5 rounded" />
                <div className="h-32 w-full bg-white/5 rounded" />
              </div>
              <div className="col-span-2 grid grid-rows-2 gap-6">
                <div className="bg-white/5 rounded-lg border border-white/5 p-4">
                  <div className="h-8 w-32 bg-white/10 rounded mb-4" />
                  <div className="flex gap-4">
                    <div className="h-24 w-24 bg-white/5 rounded-full" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-4 w-full bg-white/5 rounded" />
                      <div className="h-4 w-3/4 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg border border-white/5 p-4 grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded h-full" />
                  <div className="bg-white/5 rounded h-full" />
                  <div className="bg-white/5 rounded h-full" />
                </div>
              </div>
            </div>

            {/* Reflection/Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  )
}

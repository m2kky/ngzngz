"use client"

import { Button } from "@/components/ui/button"
import { Plug } from "lucide-react"

export function AdCenterEmptyState({ onConnect }: { onConnect: () => void }) {
    return (
        <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center max-w-md">
                {/* Glass Illustration */}
                <div className="relative mb-8">
                    <div className="glass-panel w-64 h-64 rounded-full mx-auto flex items-center justify-center border-2 border-white/10">
                        <div className="relative">
                            {/* Disconnected Plug Icon */}
                            <Plug size={80} className="text-zinc-600 transform rotate-45" />
                            <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                        </div>
                    </div>
                    {/* Glow Effect */}
                    <div className="absolute inset-0 blur-3xl opacity-20 bg-[var(--brand)]" />
                </div>

                {/* Copy */}
                <h2 className="text-3xl font-bold text-white mb-3">
                    Offline Mode
                </h2>
                <p className="text-xl text-zinc-400 mb-2">
                    Plug in your grid.
                </p>
                <p className="text-sm text-zinc-500 mb-8">
                    Connect your ad accounts to start viewing live campaign performance data
                </p>

                {/* CTA */}
                <Button
                    onClick={onConnect}
                    className="bg-[var(--brand)] text-black hover:opacity-90 font-bold text-lg px-8 py-6 shadow-[0_0_30px_rgba(204,255,0,0.3)]"
                >
                    <Plug size={20} className="mr-2" />
                    Connect Ad Accounts
                </Button>

                {/* Supported Platforms */}
                <div className="mt-8">
                    <p className="text-xs text-zinc-500 mb-3">Supported Platforms</p>
                    <div className="flex items-center justify-center gap-4 opacity-50">
                        <div className="w-8 h-8 rounded-full bg-blue-500" />
                        <div className="w-8 h-8 rounded-full bg-black" />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-red-500" />
                    </div>
                </div>
            </div>
        </div>
    )
}

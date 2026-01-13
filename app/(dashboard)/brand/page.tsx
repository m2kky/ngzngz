"use client"

import { BrandLogoPanel } from "@/components/brand/brand-logo-panel"
import { BrandColorPanel } from "@/components/brand/brand-color-panel"
import { BrandTypographyPanel } from "@/components/brand/brand-typography-panel"
import { BrandVoicePanel } from "@/components/brand/brand-voice-panel"

export default function BrandKitPage() {
    return (
        <div className="flex-1 overflow-auto p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Brand Kit</h1>
                <p className="text-zinc-400">
                    Manage your brand identity, colors, typography, and AI voice settings
                </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BrandLogoPanel />
                <BrandColorPanel />
                <BrandTypographyPanel />
                <BrandVoicePanel />
            </div>
        </div>
    )
}

"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, CheckCircle } from "lucide-react"
import { PLATFORM_GUIDES } from "@/lib/data/platform-guides"
import { useState } from "react"
import { toast } from "sonner"

interface GuideDrawerProps {
    open: boolean
    platform: string | null
    onClose: () => void
}

export function GuideDrawer({ open, platform, onClose }: GuideDrawerProps) {
    const [copiedLink, setCopiedLink] = useState<string | null>(null)

    if (!platform) return null

    const guide = PLATFORM_GUIDES[platform]
    if (!guide) return null

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url)
        setCopiedLink(url)
        toast.success("Link copied to clipboard")
        setTimeout(() => setCopiedLink(null), 2000)
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-md md:max-w-lg glass-panel border-l border-white/20 p-0 overflow-hidden flex flex-col">
                <SheetHeader className="p-6 pb-2">
                    <SheetTitle className="text-2xl font-bold text-white">
                        {guide.title}
                    </SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        {guide.description}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="space-y-8 pb-8 pt-4">
                        {/* Steps */}
                        <div className="space-y-8">
                            {guide.steps.map((step, index) => (
                                <div key={index} className="relative pl-8 border-l-2 border-white/10 last:border-l-0">
                                    {/* Step Number */}
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--brand)] border-2 border-black flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-white leading-none">
                                            Step {index + 1}: {step.title}
                                        </h3>
                                        <p className="text-sm text-zinc-300 leading-relaxed">
                                            {step.text}
                                        </p>

                                        {/* Image Placeholder */}
                                        <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10 group cursor-zoom-in">
                                            {/* In a real app, we would use Next.js Image here */}
                                            <div className="absolute inset-0 flex items-center justify-center text-zinc-600 bg-zinc-900/50">
                                                <span className="text-xs font-mono">Image: {step.image}</span>
                                            </div>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Useful Links */}
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4">Useful Links</h3>
                            <div className="space-y-3">
                                {guide.links.map((link, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 rounded-md bg-blue-500/20 text-blue-400">
                                                <ExternalLink size={16} />
                                            </div>
                                            <div className="truncate">
                                                <div className="text-sm font-medium text-white truncate">{link.label}</div>
                                                <div className="text-xs text-zinc-500 truncate">{link.url}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pl-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-zinc-400 hover:text-white"
                                                onClick={() => handleCopyLink(link.url)}
                                            >
                                                {copiedLink === link.url ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-zinc-400 hover:text-white"
                                                onClick={() => window.open(link.url, '_blank')}
                                            >
                                                <ExternalLink size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
                    <Button onClick={onClose} className="w-full bg-white/10 hover:bg-white/20 text-white">
                        Got it, thanks!
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

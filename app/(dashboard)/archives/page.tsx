"use client"

import { Archive } from "lucide-react"

export default function ArchivesPage() {
    return (
        <div className="animate-fade-in flex flex-col items-center justify-center h-[60vh] text-zinc-500">
            <Archive size={64} className="mb-4 text-zinc-700" />
            <h2 className="text-xl font-bold text-white">Archives</h2>
            <p>No archived projects yet. Keep shipping! 🚀</p>
        </div>
    )
}

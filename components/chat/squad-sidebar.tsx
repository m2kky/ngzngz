import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SquadMember {
    id: string
    name: string
    role: string
    avatar: string
    status: 'online' | 'offline' | 'typing'
    lastSeen?: string
}

interface SquadSidebarProps {
    projectName: string
    members: SquadMember[]
    onAnalyze: () => void
    isAnalyzing: boolean
}

export function SquadSidebar({ projectName, members, onAnalyze, isAnalyzing }: SquadSidebarProps) {
    return (
        <aside className="w-72 bg-zinc-900/50 border-l border-white/5 flex flex-col hidden md:flex h-full">
            <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-[#ccff00]">#</span> {projectName}
                </h2>
                <p className="text-xs text-zinc-500 mt-1">Active Project • {members.length} Members</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Squad</div>
                {members.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                        <div className="relative">
                            <img src={member.avatar} className="w-10 h-10 rounded-full border border-white/10" alt={member.name} />
                            <div className={cn(
                                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900",
                                member.status === 'online' ? "bg-green-500" :
                                    member.status === 'typing' ? "bg-[#ccff00] animate-pulse" : "bg-zinc-500"
                            )} />
                        </div>
                        <div>
                            <div className="text-sm font-bold group-hover:text-white transition-colors">{member.name}</div>
                            <div className={cn("text-xs", member.status === 'typing' ? "text-[#ccff00]" : "text-zinc-500")}>
                                {member.status === 'typing' ? 'Typing...' : member.role}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-white/5">
                <Button
                    onClick={onAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center gap-2">
                        <Sparkles className={cn("w-5 h-5", isAnalyzing && "animate-spin")} />
                        {isAnalyzing ? "Analyzing..." : "Analyze Chat (Gemini)"}
                    </span>
                </Button>
            </div>
        </aside>
    )
}

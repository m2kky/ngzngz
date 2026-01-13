"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { Button } from "@/components/ui/button"
import { Plus, Zap, MoreVertical, Play, Pause, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function AutomationPage() {
    const { currentWorkspace } = useWorkspace()
    const [rules, setRules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        if (currentWorkspace?.id) {
            fetchRules()
        }
    }, [currentWorkspace?.id])

    const fetchRules = async () => {
        const { data, error } = await supabase
            .from('automation_rules')
            .select('*')
            .eq('workspace_id', currentWorkspace!.id)
            .order('created_at', { ascending: false })

        if (data) setRules(data)
        setLoading(false)
    }

    const toggleActive = async (id: string, currentState: boolean) => {
        const { error } = await supabase
            .from('automation_rules')
            .update({ is_active: !currentState })
            .eq('id', id)

        if (!error) {
            toast.success(currentState ? "Flow paused" : "Flow activated")
            fetchRules()
        }
    }

    const deleteRule = async (id: string) => {
        const { error } = await supabase
            .from('automation_rules')
            .delete()
            .eq('id', id)

        if (!error) {
            toast.success("Flow deleted")
            fetchRules()
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ninja Flows</h1>
                    <p className="text-zinc-400">Automate your agency workflows with jutsu.</p>
                </div>
                <Link href="/automation/new">
                    <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                        <Plus className="w-4 h-4" />
                        New Flow
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-20 text-zinc-500">Loading scrolls...</div>
                ) : rules.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                        <Zap className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No active flows</h3>
                        <p className="text-zinc-400 mb-6">Create your first automation to save time.</p>
                        <Link href="/automation/new">
                            <Button variant="outline">Create Flow</Button>
                        </Link>
                    </div>
                ) : (
                    rules.map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between p-6 bg-zinc-900/50 border border-white/10 rounded-xl hover:border-purple-500/30 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rule.is_active ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{rule.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                                            {rule.trigger_event}
                                        </span>
                                        <span>•</span>
                                        <span>{rule.actions_chain?.length || 0} steps</span>
                                        <span>•</span>
                                        <span>Updated {formatDistanceToNow(new Date(rule.updated_at))} ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium ${rule.is_active ? 'text-green-400' : 'text-zinc-500'}`}>
                                        {rule.is_active ? 'ACTIVE' : 'PAUSED'}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={() => toggleActive(rule.id, rule.is_active)}>
                                        {rule.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => deleteRule(rule.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

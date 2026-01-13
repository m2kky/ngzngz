"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { toast } from "sonner"
import { CreateWorkspaceWizard } from "@/components/workspace/create-workspace-wizard"

export function WorkspaceSwitcher() {
    const { currentWorkspace, setCurrentWorkspace, workspaces } = useWorkspace()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newWorkspaceName, setNewWorkspaceName] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const supabase = createClient()

    async function createWorkspace() {
        if (!newWorkspaceName.trim()) {
            toast.error("Please enter a workspace name")
            return
        }

        setIsCreating(true)
        try {
            const slug = newWorkspaceName
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "") + "-" + Math.random().toString(36).substring(2, 7)

            const { data, error } = await supabase
                .from("workspaces")
                .insert([
                    {
                        name: newWorkspaceName.trim(),
                        slug: slug,
                        status: "ACTIVE",
                    },
                ])
                .select()

            if (error) {
                toast.error("Failed to create workspace")
                console.error(error)
            } else if (data && data.length > 0) {
                toast.success(`Workspace "${newWorkspaceName}" created! 🎯`)
                setNewWorkspaceName("")
                setShowCreateModal(false)
                // Reload to refresh context (simple solution for MVP)
                window.location.reload()
            }
        } catch (err) {
            toast.error("Failed to create workspace")
            console.error(err)
        } finally {
            setIsCreating(false)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <>
            <div className="w-[72px] flex-shrink-0 bg-zinc-950 border-r border-zinc-900 flex flex-col items-center py-4 space-y-4 z-20">
                {/* Logo */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--brand)] to-zinc-700 flex items-center justify-center text-black font-black text-xl cursor-pointer shadow-[0_0_15px_var(--brand)]">
                    N
                </div>

                {/* Workspace Icons */}
                {workspaces.map((ws) => (
                    <button
                        key={ws.id}
                        onClick={() => setCurrentWorkspace(ws)}
                        className={`w-12 h-12 rounded-[24px] flex items-center justify-center text-sm font-bold transition-all overflow-hidden ${currentWorkspace?.id === ws.id
                            ? "ring-2 ring-[var(--brand)] ring-offset-2 ring-offset-zinc-950 scale-110"
                            : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800"
                            }`}
                        title={ws.name}
                    >
                        {ws.logo_url ? (
                            <img src={ws.logo_url} alt={ws.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className={currentWorkspace?.id === ws.id ? "text-white" : ""}>
                                {getInitials(ws.name)}
                            </span>
                        )}
                    </button>
                ))}

                {/* Add New Workspace Button */}
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-12 h-12 rounded-[24px] flex items-center justify-center bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-[var(--brand)] transition-all border-2 border-dashed border-zinc-800 hover:border-[var(--brand)]"
                    title="Add New Workspace"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Create Workspace Wizard */}
            {showCreateModal && (
                <CreateWorkspaceWizard
                    onClose={() => setShowCreateModal(false)}
                    onComplete={() => {
                        setShowCreateModal(false)
                        window.location.reload()
                    }}
                />
            )}
        </>
    )
}

"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"]

interface WorkspaceContextType {
    currentWorkspace: Workspace | null
    setCurrentWorkspace: (workspace: Workspace) => void
    workspaces: Workspace[]
    isLoading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchWorkspaces() {
            try {
                const { data } = await supabase
                    .from("workspaces")
                    .select("*")
                    .eq("status", "ACTIVE")
                    .order("created_at", { ascending: true })

                if (data) {
                    setWorkspaces(data)
                    // Auto-select first workspace if none selected
                    if (data.length > 0 && !currentWorkspace) {
                        setCurrentWorkspace(data[0])
                    }
                }
            } catch (error) {
                console.error("Failed to fetch workspaces", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchWorkspaces()
    }, [])

    return (
        <WorkspaceContext.Provider value={{ currentWorkspace, setCurrentWorkspace, workspaces, isLoading }}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext)
    if (context === undefined) {
        throw new Error("useWorkspace must be used within a WorkspaceProvider")
    }
    return context
}

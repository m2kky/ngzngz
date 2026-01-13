"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { Button } from "@/components/ui/button"
import { Plus, FolderKanban } from "lucide-react"
import { ProjectModal } from "@/components/projects/project-modal"
import { ProjectCard } from "@/components/projects/project-card"
import { toast } from "sonner"

import type { Database } from "@/types/database"

type Project = Database["public"]["Tables"]["projects"]["Row"] & {
    clients?: { name: string; logo_url: string | null } | null
}

export interface ProjectWithStats extends Project {
    stats: {
        total: number
        pending: number
        review: number
        done: number
        progress: number
    }
    team: string[] // Array of avatar URLs
}

export default function ProjectsPage() {
    const { currentWorkspace } = useWorkspace()
    const [projects, setProjects] = useState<ProjectWithStats[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (currentWorkspace) {
            fetchProjects()
        }
    }, [currentWorkspace])

    async function fetchProjects() {
        try {
            // 1. Fetch Projects with Client data
            const { data: projectsData, error: projectsError } = await supabase
                .from("projects")
                .select("*, clients(name, logo_url)")
                .eq("workspace_id", currentWorkspace!.id)
                .order("created_at", { ascending: false })

            if (projectsError) throw projectsError

            // 2. Fetch All Tasks for Workspace to aggregate stats
            const { data: tasksData, error: tasksError } = await supabase
                .from("tasks")
                .select("project_id, status, assignee_id, assignee:users!tasks_assignee_id_fkey(avatar_url)")
                .eq("workspace_id", currentWorkspace!.id)

            if (tasksError) throw tasksError

            // 3. Aggregate Stats
            const projectsWithStats: ProjectWithStats[] = (projectsData || []).map((project: any) => {
                const projectTasks = tasksData?.filter(t => t.project_id === project.id) || []

                const total = projectTasks.length
                const done = projectTasks.filter(t => ["APPROVED", "PUBLISHED"].includes(t.status)).length
                const review = projectTasks.filter(t => ["INTERNAL_REVIEW", "CLIENT_REVIEW", "AI_CHECK"].includes(t.status)).length
                const pending = total - done - review

                const progress = total > 0 ? Math.round((done / total) * 100) : 0

                // Extract unique team members (assignees)
                const team = Array.from(new Set(
                    projectTasks
                        .map(t => (t.assignee as any)?.avatar_url)
                        .filter(Boolean)
                )) as string[]

                return {
                    ...project,
                    stats: { total, pending, review, done, progress },
                    team
                }
            })

            setProjects(projectsWithStats)
        } catch (error: any) {
            console.error("Error fetching projects:", JSON.stringify(error, null, 2))
            toast.error(`Failed to load projects: ${error.message || 'Unknown error'}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateProject = () => {
        setSelectedProject(null)
        setIsModalOpen(true)
    }

    const handleSaveProject = async () => {
        await fetchProjects()
        setIsModalOpen(false)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Projects</h1>
                    <p className="text-zinc-400 mt-2">
                        Manage your marketing campaigns and projects.
                    </p>
                </div>
                <Button onClick={handleCreateProject} className="bg-[var(--brand)] text-black hover:bg-[#b3ff00] font-bold">
                    <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-96 bg-zinc-900/50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-xl">
                    <FolderKanban className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                    <h3 className="text-lg font-medium text-white">No projects yet</h3>
                    <p className="text-zinc-400 mt-2 mb-6">
                        Create your first project to get started.
                    </p>
                    <Button onClick={handleCreateProject} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-white/5">
                        Create Project
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                        />
                    ))}
                </div>
            )}

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProject}
                project={selectedProject}
            />
        </div>
    )
}

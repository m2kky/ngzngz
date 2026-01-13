"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Sparkles, Eye, Copy, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { Database } from "@/types/database"
import { ReportGeneratorModal } from "@/components/reports/report-generator-modal"

type Report = Database["public"]["Tables"]["reports"]["Row"]

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string>("")
    const { currentWorkspace } = useWorkspace()
    const supabase = createClient()

    useEffect(() => {
        async function init() {
            // Get User
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)

            if (currentWorkspace?.id) {
                fetchReports()
            } else {
                setLoading(false)
            }
        }
        init()
    }, [currentWorkspace])

    const fetchReports = async () => {
        if (!currentWorkspace?.id) return

        const { data, error } = await supabase
            .from("reports")
            .select("*")
            .eq("workspace_id", currentWorkspace.id)
            .order("created_at", { ascending: false })

        if (error) {
            toast.error("Failed to load reports")
            console.error(error)
        } else {
            setReports(data || [])
        }
        setLoading(false)
    }

    // copyPublicLink... deleteReport... (omitted in tool, retained in file)
    const copyPublicLink = (token: string) => {
        const url = `${window.location.origin}/r/${token}`
        navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard!")
    }

    const deleteReport = async (id: string) => {
        if (!confirm("Delete this report?")) return

        const { error } = await supabase.from("reports").delete().eq("id", id)

        if (error) {
            toast.error("Failed to delete report")
        } else {
            toast.success("Report deleted")
            fetchReports()
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Sparkles className="text-[var(--brand)]" />
                        Flash Reports
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Create stunning story-style reports for your clients
                    </p>
                </div>
                {currentWorkspace && userId && (
                    <ReportGeneratorModal
                        workspaceId={currentWorkspace.id}
                        userId={userId}
                    />
                )}
            </div>

            {reports.length === 0 ? (
                <Card className="glass-panel p-12 text-center">
                    <Sparkles className="mx-auto mb-4 text-[var(--brand)]" size={48} />
                    <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
                    <p className="text-zinc-400 mb-6">
                        Create your first Flash Report and wow your clients
                    </p>
                    {currentWorkspace && userId && (
                        <ReportGeneratorModal
                            workspaceId={currentWorkspace.id}
                            userId={userId}
                            trigger={
                                <Button className="gap-2">
                                    <Plus size={18} />
                                    Create First Report
                                </Button>
                            }
                        />
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => (
                        <Card key={report.id} className="glass-panel p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{report.title}</h3>
                                    <p className="text-sm text-zinc-400">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded text-xs ${report.status === "PUBLISHED"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-yellow-500/20 text-yellow-400"
                                        }`}
                                >
                                    {report.status}
                                </span>
                            </div>

                            {report.ai_summary && (
                                <p className="text-sm text-zinc-300 line-clamp-2">
                                    {report.ai_summary}
                                </p>
                            )}

                            <div className="flex gap-2">
                                <Link href={`/reports/${report.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full gap-2">
                                        <Edit size={16} />
                                        Edit
                                    </Button>
                                </Link>
                                {report.status === "PUBLISHED" && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => window.open(`/r/${report.public_token}`, "_blank")}
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => copyPublicLink(report.public_token)}
                                        >
                                            <Copy size={16} />
                                        </Button>
                                    </>
                                )}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => deleteReport(report.id)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

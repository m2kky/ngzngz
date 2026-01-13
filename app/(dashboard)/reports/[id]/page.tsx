"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Save, Eye, Sparkles, ArrowDownToLine } from "lucide-react"
import { toast } from "sonner"
import type { Database } from "@/types/database"

type Report = Database["public"]["Tables"]["reports"]["Row"]

interface Slide {
  id: string
  type: "title" | "content" | "chart" | "image"
  title: string
  content: string
  order: number
}

export default function ReportEditor() {
  const params = useParams()
  const router = useRouter()
  const { currentWorkspace } = useWorkspace()
  const supabase = createClient() as any

  const [report, setReport] = useState<Report | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [selectedSlide, setSelectedSlide] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id && currentWorkspace?.id) {
      fetchReport()
    }
  }, [params.id, currentWorkspace])

  const fetchReport = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", params.id)
      .eq("workspace_id", currentWorkspace?.id)
      .single()

    if (error) {
      toast.error("Report not found")
      router.push("/reports")
      return
    }

    setReport(data)

    // Parse slides from config or create default slide
    const slidesConfig = data.slides_config as Slide[] || []

    // Auto-Generate logic if empty and project_id exists
    if (slidesConfig.length === 0 && (data as any).project_id) {
      generateProjectSlides((data as any).project_id)
    } else if (slidesConfig.length === 0) {
      const defaultSlide: Slide = {
        id: "1",
        type: "title",
        title: "Welcome",
        content: "Your story starts here...",
        order: 0
      }
      setSlides([defaultSlide])
      setSelectedSlide("1")
    } else {
      setSlides(slidesConfig.sort((a, b) => a.order - b.order))
      setSelectedSlide(slidesConfig[0]?.id || null)
    }

    setLoading(false)
  }

  const generateProjectSlides = async (projectId: string) => {
    // Fetch project details
    const { data: project } = await supabase.from('projects').select('*, client:clients(*)').eq('id', projectId).single()

    const newSlides: Slide[] = [
      {
        id: "1", type: "title", order: 0,
        title: project?.name || "Project Update",
        content: `Prepared for ${project?.client?.name || 'Client'}\n${new Date().toLocaleDateString()}`
      },
      {
        id: "2", type: "content", order: 1,
        title: "Executive Summary",
        content: "We have made significant progress this week. Key milestones have been achieved and we are on track for the Q4 launch."
      },
      {
        id: "3", type: "chart", order: 2,
        title: "Performance Metrics",
        content: "Impressions: 1.2M (+15%)\nClicks: 45K\nConversion Rate: 3.2%"
      },
      {
        id: "4", type: "content", order: 3,
        title: "Next Steps",
        content: "- Finalize creative assets\n- approval on budget increase\n- Launch phase 2"
      }
    ]

    setSlides(newSlides)
    setSelectedSlide("1")

    // Auto-save these initial slides
    await supabase.from("reports").update({ slides_config: newSlides }).eq("id", params.id)
  }

  const handleDownload = () => {
    // Mock Download for now, or trigger print
    window.print()
  }

  const saveReport = async () => {
    if (!report) return

    setSaving(true)
    const { error } = await supabase
      .from("reports")
      .update({
        title: report.title,
        slides_config: slides,
        updated_at: new Date().toISOString()
      })
      .eq("id", report.id)

    if (error) {
      toast.error("Failed to save report")
    } else {
      toast.success("Report saved!")
    }
    setSaving(false)
  }

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      type: "content",
      title: "New Slide",
      content: "",
      order: slides.length
    }
    setSlides([...slides, newSlide])
    setSelectedSlide(newSlide.id)
  }

  const updateSlide = (id: string, updates: Partial<Slide>) => {
    setSlides(slides.map(slide =>
      slide.id === id ? { ...slide, ...updates } : slide
    ))
  }

  const deleteSlide = (id: string) => {
    if (slides.length === 1) {
      toast.error("Cannot delete the last slide")
      return
    }

    const newSlides = slides.filter(slide => slide.id !== id)
    setSlides(newSlides)

    if (selectedSlide === id) {
      setSelectedSlide(newSlides[0]?.id || null)
    }
  }

  const currentSlide = slides.find(slide => slide.id === selectedSlide)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Report not found</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/reports")}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <Input
              value={report.title}
              onChange={(e) => setReport({ ...report, title: e.target.value })}
              className="text-xl font-semibold bg-transparent border-none p-0 h-auto"
            />
            <p className="text-sm text-zinc-400">Report Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <ArrowDownToLine size={16} className="mr-2" />
            Download PDF
          </Button>
          <Button onClick={saveReport} disabled={saving} size="sm">
            <Save size={16} className="mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Slide Sorter */}
        <div className="w-80 border-r border-zinc-800 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Slides</h3>
            <Button onClick={addSlide} size="sm" variant="outline">
              <Plus size={16} />
            </Button>
          </div>

          <div className="space-y-2">
            {slides.map((slide, index) => (
              <Card
                key={slide.id}
                className={`p-3 cursor-pointer transition-colors ${selectedSlide === slide.id
                  ? "bg-[var(--brand)]/20 border-[var(--brand)]"
                  : "glass-panel hover:bg-zinc-800/50"
                  }`}
                onClick={() => setSelectedSlide(slide.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{slide.title}</p>
                    <p className="text-xs text-zinc-400 capitalize">{slide.type}</p>
                  </div>
                  <span className="text-xs text-zinc-500">#{index + 1}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-6">
          {currentSlide ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="glass-panel p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-[var(--brand)]" size={20} />
                    <Input
                      value={currentSlide.title}
                      onChange={(e) => updateSlide(currentSlide.id, { title: e.target.value })}
                      className="text-2xl font-bold bg-transparent border-none p-0 h-auto"
                      placeholder="Slide title..."
                    />
                  </div>

                  <textarea
                    value={currentSlide.content}
                    onChange={(e) => updateSlide(currentSlide.id, { content: e.target.value })}
                    placeholder="Tell your story..."
                    className="w-full h-64 bg-transparent border border-zinc-700 rounded-lg p-4 resize-none focus:outline-none focus:border-[var(--brand)]"
                  />

                  <div className="flex justify-between">
                    <select
                      value={currentSlide.type}
                      onChange={(e) => updateSlide(currentSlide.id, { type: e.target.value as Slide["type"] })}
                      className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-sm"
                    >
                      <option value="title">Title Slide</option>
                      <option value="content">Content Slide</option>
                      <option value="chart">Chart Slide</option>
                      <option value="image">Image Slide</option>
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSlide(currentSlide.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete Slide
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-zinc-400">Select a slide to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
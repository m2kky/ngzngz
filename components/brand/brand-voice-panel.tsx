"use client"

import { useState, useEffect } from "react"
import { Sparkles, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "@/components/providers/workspace-provider"
import { toast } from "sonner"

export function BrandVoicePanel() {
    const [name, setName] = useState("Brand Voice")
    const [toneKeywords, setToneKeywords] = useState<string[]>([])
    const [newKeyword, setNewKeyword] = useState("")
    const [guidelines, setGuidelines] = useState("")
    const [dos, setDos] = useState<string[]>([])
    const [donts, setDonts] = useState<string[]>([])
    const [newDo, setNewDo] = useState("")
    const [newDont, setNewDont] = useState("")
    const [voiceId, setVoiceId] = useState<string | null>(null)
    const { currentWorkspace } = useWorkspace()
    const supabase = createClient()

    useEffect(() => {
        if (currentWorkspace) {
            loadBrandVoice()
        }
    }, [currentWorkspace])

    const loadBrandVoice = async () => {
        if (!currentWorkspace) return

        const { data, error } = await supabase
            .from('brand_voice')
            .select('*')
            .eq('workspace_id', currentWorkspace.id)
            .single()

        if (data) {
            setVoiceId(data.id)
            setName(data.name || "Brand Voice")
            setToneKeywords(data.tone_keywords || [])
            setGuidelines(data.guidelines || "")
            setDos(data.dos || [])
            setDonts(data.donts || [])
        }
    }

    const saveBrandVoice = async () => {
        if (!currentWorkspace) return

        const voiceData = {
            workspace_id: currentWorkspace.id,
            name,
            tone_keywords: toneKeywords,
            guidelines,
            dos,
            donts,
        }

        let error
        if (voiceId) {
            const result = await supabase
                .from('brand_voice')
                .update(voiceData)
                .eq('id', voiceId)
            error = result.error
        } else {
            const result = await supabase
                .from('brand_voice')
                .insert([voiceData])
                .select()
                .single()
            error = result.error
            if (result.data) setVoiceId(result.data.id)
        }

        if (error) {
            toast.error("Failed to save brand voice")
            console.error(error)
        } else {
            toast.success("Brand voice saved!")
        }
    }

    const addKeyword = () => {
        if (newKeyword.trim() && !toneKeywords.includes(newKeyword.trim())) {
            setToneKeywords([...toneKeywords, newKeyword.trim()])
            setNewKeyword("")
        }
    }

    const removeKeyword = (keyword: string) => {
        setToneKeywords(toneKeywords.filter(k => k !== keyword))
    }

    const addDo = () => {
        if (newDo.trim() && !dos.includes(newDo.trim())) {
            setDos([...dos, newDo.trim()])
            setNewDo("")
        }
    }

    const removeDo = (index: number) => {
        setDos(dos.filter((_, i) => i !== index))
    }

    const addDont = () => {
        if (newDont.trim() && !donts.includes(newDont.trim())) {
            setDonts([...donts, newDont.trim()])
            setNewDont("")
        }
    }

    const removeDont = (index: number) => {
        setDonts(donts.filter((_, i) => i !== index))
    }

    return (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-[var(--brand)]" />
                    Sensei Voice
                </h3>
                <p className="text-sm text-zinc-400 mt-1">Define your AI personality</p>
            </div>

            <div className="space-y-6">
                {/* Tone Keywords */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-white">Tone Keywords</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {toneKeywords.map((keyword) => (
                            <span
                                key={keyword}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--brand)]/20 text-[var(--brand)] rounded-full text-sm border border-[var(--brand)]/30"
                            >
                                {keyword}
                                <button onClick={() => removeKeyword(keyword)} className="hover:text-white">
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                            placeholder="e.g., friendly, professional, witty"
                            className="bg-white/5 border-white/20 text-white"
                        />
                        <Button onClick={addKeyword} size="icon" variant="outline" className="border-white/20">
                            <Plus size={16} />
                        </Button>
                    </div>
                </div>

                {/* Guidelines */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-white">Guidelines</label>
                    <Textarea
                        value={guidelines}
                        onChange={(e) => setGuidelines(e.target.value)}
                        placeholder="Describe your brand's communication style, values, and personality..."
                        className="bg-white/5 border-white/20 text-white min-h-[100px]"
                    />
                </div>

                {/* Do's */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-green-400">Do's</label>
                    <ul className="space-y-2 mb-2">
                        {dos.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-white bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                <span className="flex-1">{item}</span>
                                <button onClick={() => removeDo(index)} className="text-zinc-400 hover:text-white">
                                    <X size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-2">
                        <Input
                            value={newDo}
                            onChange={(e) => setNewDo(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addDo()}
                            placeholder="Add a best practice..."
                            className="bg-white/5 border-white/20 text-white"
                        />
                        <Button onClick={addDo} size="icon" variant="outline" className="border-green-500/30">
                            <Plus size={16} />
                        </Button>
                    </div>
                </div>

                {/* Don'ts */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-red-400">Don'ts</label>
                    <ul className="space-y-2 mb-2">
                        {donts.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-white bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <span className="flex-1">{item}</span>
                                <button onClick={() => removeDont(index)} className="text-zinc-400 hover:text-white">
                                    <X size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-2">
                        <Input
                            value={newDont}
                            onChange={(e) => setNewDont(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addDont()}
                            placeholder="Add something to avoid..."
                            className="bg-white/5 border-white/20 text-white"
                        />
                        <Button onClick={addDont} size="icon" variant="outline" className="border-red-500/30">
                            <Plus size={16} />
                        </Button>
                    </div>
                </div>

                {/* Save Button */}
                <Button onClick={saveBrandVoice} className="w-full bg-[var(--brand)] text-black hover:opacity-90">
                    Save Brand Voice
                </Button>
            </div>
        </div>
    )
}

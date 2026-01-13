"use client"

import { useState } from "react"
import { Sparkles, Save, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function BrandVoiceEditor() {
    const [brandName, setBrandName] = useState("Your Brand")
    const [toneKeywords, setToneKeywords] = useState<string[]>(["Professional", "Friendly", "Innovative"])
    const [newKeyword, setNewKeyword] = useState("")
    const [guidelines, setGuidelines] = useState("Always use emojis\nKeep it casual\nBe authentic")
    const [dosList, setDosList] = useState<string[]>(["Use Gen Z slang", "Be authentic", "Add emojis"])
    const [dontsList, setDontsList] = useState<string[]>(["Be too formal", "Use corporate jargon"])
    const [newDo, setNewDo] = useState("")
    const [newDont, setNewDont] = useState("")

    const addKeyword = () => {
        if (newKeyword.trim()) {
            setToneKeywords([...toneKeywords, newKeyword.trim()])
            setNewKeyword("")
        }
    }

    const removeKeyword = (index: number) => {
        setToneKeywords(toneKeywords.filter((_, i) => i !== index))
    }

    const addDo = () => {
        if (newDo.trim()) {
            setDosList([...dosList, newDo.trim()])
            setNewDo("")
        }
    }

    const addDont = () => {
        if (newDont.trim()) {
            setDontsList([...dontsList, newDont.trim()])
            setNewDont("")
        }
    }

    const handleSave = () => {
        // TODO: Save to Supabase
        toast.success("Brand Voice saved! ✨")
    }

    return (
        <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="text-[#ccff00]" size={24} />
                    <h3 className="text-xl font-bold text-white">Brand Voice Configuration</h3>
                </div>

                <div className="space-y-6">
                    {/* Brand Name */}
                    <div>
                        <Label htmlFor="brandName">Brand Name</Label>
                        <Input
                            id="brandName"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="mt-2 bg-zinc-950 border-zinc-800"
                            placeholder="Your Brand"
                        />
                    </div>

                    {/* Tone Keywords */}
                    <div>
                        <Label>Tone Keywords</Label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                            {toneKeywords.map((keyword, index) => (
                                <Badge key={index} className="bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20">
                                    {keyword}
                                    <button
                                        onClick={() => removeKeyword(index)}
                                        className="ml-2 hover:text-red-400"
                                    >
                                        <X size={12} />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                                placeholder="Add keyword..."
                                className="bg-zinc-950 border-zinc-800"
                            />
                            <Button onClick={addKeyword} variant="outline" size="icon">
                                <Plus size={16} />
                            </Button>
                        </div>
                    </div>

                    {/* Writing Guidelines */}
                    <div>
                        <Label htmlFor="guidelines">Writing Guidelines</Label>
                        <Textarea
                            id="guidelines"
                            value={guidelines}
                            onChange={(e) => setGuidelines(e.target.value)}
                            className="mt-2 bg-zinc-950 border-zinc-800 min-h-[100px]"
                            placeholder="Enter your brand guidelines..."
                        />
                    </div>

                    {/* Do's and Don'ts */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Label className="text-green-400">✓ Do's</Label>
                            <div className="space-y-2 mt-2 mb-2">
                                {dosList.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-zinc-300">
                                        <span className="text-green-400">✓</span>
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newDo}
                                    onChange={(e) => setNewDo(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addDo()}
                                    placeholder="Add do..."
                                    className="bg-zinc-950 border-zinc-800 text-sm"
                                />
                                <Button onClick={addDo} variant="outline" size="icon" className="shrink-0">
                                    <Plus size={16} />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label className="text-red-400">✗ Don'ts</Label>
                            <div className="space-y-2 mt-2 mb-2">
                                {dontsList.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-zinc-300">
                                        <span className="text-red-400">✗</span>
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newDont}
                                    onChange={(e) => setNewDont(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addDont()}
                                    placeholder="Add don't..."
                                    className="bg-zinc-950 border-zinc-800 text-sm"
                                />
                                <Button onClick={addDont} variant="outline" size="icon" className="shrink-0">
                                    <Plus size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} className="bg-[#ccff00] text-black hover:bg-[#b3ff00]">
                            <Save size={16} className="mr-2" />
                            Save Brand Voice
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

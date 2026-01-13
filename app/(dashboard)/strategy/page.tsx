"use client"

import { useState, useEffect } from "react"
import { Plus, Target } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BrandVoiceEditor } from "@/components/strategy/brand-voice-editor"
import { PersonaCreator } from "@/components/strategy/persona-creator"
import { PersonaCard } from "@/components/strategy/persona-card"
import { StrategyCreator } from "@/components/strategy/strategy-creator"
import { StrategyCard } from "@/components/strategy/strategy-card"
import type { Database } from "@/types/database"
import { toast } from "sonner"

type Persona = Database["public"]["Tables"]["personas"]["Row"]
type Strategy = any

export default function StrategyPage() {
    const [personas, setPersonas] = useState<Persona[]>([])
    const [strategies, setStrategies] = useState<Strategy[]>([])
    const [showPersonaCreator, setShowPersonaCreator] = useState(false)
    const [showStrategyCreator, setShowStrategyCreator] = useState(false)
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
    const supabase = createClient() as any

    useEffect(() => {
        fetchPersonas()
        fetchStrategies()
    }, [])

    async function fetchPersonas() {
        const { data } = await supabase
            .from("personas")
            .select("*")
            .order("created_at", { ascending: false })

        if (data) {
            setPersonas(data)
        }
    }

    async function fetchStrategies() {
        const { data } = await supabase
            .from("strategies")
            .select("*")
            .order("created_at", { ascending: false })

        if (data) {
            setStrategies(data)
        }
    }

    const handleEditPersona = (persona: Persona) => {
        setSelectedPersona(persona)
        setShowPersonaCreator(true)
    }

    const handleEditStrategy = (strategy: Strategy) => {
        setSelectedStrategy(strategy)
        setShowStrategyCreator(true)
    }

    const handleCreatePersona = () => {
        setSelectedPersona(null)
        setShowPersonaCreator(true)
    }

    const handleCreateStrategy = () => {
        setSelectedStrategy(null)
        setShowStrategyCreator(true)
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Strategy Hub</h2>
                <Button
                    onClick={handleCreatePersona}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                >
                    <Plus size={16} className="mr-2" />
                    New Persona
                </Button>
            </div>

            {/* Marketing Strategies */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Target className="text-[#a855f7]" size={20} />
                        Marketing Strategies (SOSTAC)
                    </h3>
                    <Button
                        onClick={handleCreateStrategy}
                        className="bg-[#a855f7] text-white hover:bg-[#9333ea]"
                        size="sm"
                    >
                        <Plus size={14} className="mr-2" />
                        New Strategy
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {strategies.length === 0 ? (
                        <Card className="col-span-full bg-zinc-900 border-zinc-800 p-8 text-center">
                            <p className="text-zinc-500 text-sm">No strategies yet. Create your first SOSTAC marketing strategy!</p>
                        </Card>
                    ) : (
                        strategies.map((s) => (
                            <StrategyCard
                                key={s.id}
                                strategy={s}
                                onView={() => handleEditStrategy(s)}
                                onEdit={() => handleEditStrategy(s)}
                                onDelete={async () => {
                                    const { error } = await supabase.from("strategies").delete().eq("id", s.id)
                                    if (!error) {
                                        toast.success("Strategy deleted!")
                                        fetchStrategies()
                                    }
                                }}
                            />
                        ))
                    )}
                </div>
            </div>

            <Separator className="my-8 bg-zinc-800" />

            {/* Personas */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Buyer Personas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {personas.length === 0 ? (
                        <Card className="col-span-full bg-zinc-900 border-zinc-800 p-12 text-center">
                            <p className="text-zinc-500">No personas yet. Create your first buyer persona!</p>
                        </Card>
                    ) : (
                        personas.map((p) => (
                            <PersonaCard
                                key={p.id}
                                persona={p}
                                onView={() => handleEditPersona(p)}
                                onEdit={() => handleEditPersona(p)}
                                onDelete={async () => {
                                    const { error } = await supabase.from("personas").delete().eq("id", p.id)
                                    if (!error) {
                                        toast.success("Persona deleted!")
                                        fetchPersonas()
                                    }
                                }}
                            />
                        ))
                    )}
                </div>
            </div>

            <Separator className="my-8 bg-zinc-800" />

            {/* Brand Voice Section */}
            <BrandVoiceEditor />

            {/* Persona Creator Modal */}
            {showPersonaCreator && (
                <PersonaCreator
                    initialData={selectedPersona}
                    onClose={() => setShowPersonaCreator(false)}
                    onSave={async (personaData) => {
                        try {
                            const payload = {
                                name: personaData.name,
                                core_profile: personaData.core_profile,
                                professional: personaData.professional,
                                goals: personaData.goals,
                                purchasing: personaData.purchasing,
                                technology: personaData.technology,
                                solution: personaData.solution,
                                pain_points: personaData.goals?.painPoints || [],
                                tone_keywords: personaData.goals?.secondaryGoals || [],
                            }

                            if (selectedPersona) {
                                // Update existing
                                const { error } = await supabase
                                    .from("personas")
                                    .update(payload)
                                    .eq("id", selectedPersona.id)

                                if (error) throw error
                                toast.success("Persona updated! 🎯")
                            } else {
                                // Create new
                                const { error } = await supabase
                                    .from("personas")
                                    .insert([payload])

                                if (error) throw error
                                toast.success("Persona created! 🎯")
                            }

                            setShowPersonaCreator(false)
                            fetchPersonas()
                        } catch (err) {
                            toast.error("Failed to save persona")
                            console.error(err)
                        }
                    }}
                />
            )}

            {/* Strategy Creator Modal */}
            {showStrategyCreator && (
                <StrategyCreator
                    initialData={selectedStrategy}
                    onClose={() => setShowStrategyCreator(false)}
                    onSave={async (strategyData) => {
                        try {
                            // Map SOSTAC data to new strategies table schema
                            const mappedData = {
                                title: strategyData.name,
                                status: "draft",
                                business_context: strategyData.situation,
                                market_sizing: {
                                    swot: strategyData.situation?.swot,
                                    externalAudit: strategyData.situation?.external,
                                },
                                competitive_analysis: strategyData.situation?.swot,
                                target_audience: strategyData.situation?.external?.targetAudience,
                                marketing_objectives: strategyData.objectives,
                                product_strategy: strategyData.strategy,
                                pricing_strategy: { model: strategyData.strategy?.pricingStrategy },
                                distribution_strategy: { targeting: strategyData.strategy?.targeting },
                                promotion_mix: { messaging: strategyData.strategy?.coreMessaging },
                                budget_allocation: strategyData.tactics,
                                team_structure: strategyData.action,
                                tech_stack: { sla: strategyData.action?.sla },
                                kpis: strategyData.control,
                                risks: { measurement: strategyData.control?.measurement },
                            }

                            if (selectedStrategy) {
                                // Update existing
                                const { error } = await supabase
                                    .from("strategies")
                                    .update(mappedData)
                                    .eq("id", selectedStrategy.id)

                                if (error) throw error
                                toast.success("Strategy updated! 🎯")
                            } else {
                                // Create new
                                const { error } = await supabase
                                    .from("strategies")
                                    .insert([mappedData])

                                if (error) throw error
                                toast.success("Strategy created! 🎯")
                            }

                            setShowStrategyCreator(false)
                            fetchStrategies()
                        } catch (err) {
                            toast.error("Failed to save strategy")
                            console.error(err)
                        }
                    }}
                />
            )}
        </div>
    )
}

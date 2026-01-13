"use client"

import { useState } from "react"
import { Save, X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface StrategyCreatorProps {
    onClose: () => void
    onSave: (strategy: any) => void
    initialData?: any
}

export function StrategyCreator({ onClose, onSave, initialData }: StrategyCreatorProps) {
    // Basic Info
    const [strategyName, setStrategyName] = useState(initialData?.name || initialData?.title || "")

    // S1 - Situation Analysis
    const [internalAudit, setInternalAudit] = useState(initialData?.situation?.internal || {
        uvp: "",
        weaknesses: "",
        performance: "",
    })
    const [externalAudit, setExternalAudit] = useState(initialData?.situation?.external || {
        targetAudience: "",
        unmetNeeds: "",
        competitors: "",
        macroTrends: "",
    })
    const [swot, setSwot] = useState(initialData?.situation?.swot || {
        strengths: "",
        weaknesses: "",
        opportunities: "",
        threats: "",
    })

    // O - Objectives
    const [businessGoals, setBusinessGoals] = useState(initialData?.objectives?.business || "")
    const [marketingObjectives, setMarketingObjectives] = useState<string[]>(
        Array.isArray(initialData?.objectives?.marketing) ? initialData.objectives.marketing : ["", "", ""]
    )

    // S2 - Strategy
    const [strategy, setStrategy] = useState(initialData?.strategy || {
        targeting: "",
        competitiveAdvantage: "",
        coreMessaging: "",
        pricingStrategy: "",
    })

    // T - Tactics
    const [tactics, setTactics] = useState<any[]>(
        Array.isArray(initialData?.tactics) ? initialData.tactics :
            Array.isArray(initialData?.budget_allocation) ? initialData.budget_allocation :
                []
    )

    // A - Action
    const [action, setAction] = useState(initialData?.action || initialData?.team_structure || {
        team: "",
        timeline: "",
        sla: "",
    })

    // C - Control
    const [control, setControl] = useState(initialData?.control || initialData?.kpis || {
        kpis: ["", "", ""],
        measurement: "",
        reporting: "",
    })

    // Ensure kpis is an array if control is loaded from initialData
    if (!Array.isArray(control.kpis)) {
        control.kpis = ["", "", ""]
    }

    const handleSave = () => {
        if (!strategyName) {
            toast.error("Please enter a strategy name")
            return
        }

        const strategyData = {
            name: strategyName,
            situation: {
                internal: internalAudit,
                external: externalAudit,
                swot,
            },
            objectives: {
                business: businessGoals,
                marketing: marketingObjectives.filter((o: string) => o.trim()),
            },
            strategy,
            tactics,
            action,
            control,
        }

        onSave(strategyData)
    }

    const addTactic = () => {
        setTactics([
            ...tactics,
            {
                channel: "",
                purpose: "",
                activity: "",
                budget: "",
                owner: "",
            },
        ])
    }

    const removeTactic = (index: number) => {
        setTactics(tactics.filter((_, i) => i !== index))
    }

    const updateTactic = (index: number, field: string, value: string) => {
        const newTactics = [...tactics]
        newTactics[index][field] = value
        setTactics(newTactics)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="bg-zinc-950 w-full max-w-5xl max-h-[90vh] rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden my-8">
                {/* Header */}
                <div className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-white">Create Marketing Strategy (SOSTAC)</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X size={24} />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Strategy Name */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <Label>Strategy Name *</Label>
                        <Input
                            value={strategyName}
                            onChange={(e) => setStrategyName(e.target.value)}
                            placeholder="Q4 2024 Growth Strategy"
                            className="mt-2 bg-zinc-950 border-zinc-800"
                        />
                    </Card>

                    {/* S - Situation Analysis */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">1. S - Situation Analysis</h3>

                        <div className="space-y-4">
                            <div>
                                <Label>Unique Value Proposition (UVP)</Label>
                                <Textarea
                                    value={internalAudit.uvp}
                                    onChange={(e) => setInternalAudit({ ...internalAudit, uvp: e.target.value })}
                                    placeholder="What makes your offering unique?"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div>
                                <Label>Current Performance (Last 3-6 months)</Label>
                                <Textarea
                                    value={internalAudit.performance}
                                    onChange={(e) => setInternalAudit({ ...internalAudit, performance: e.target.value })}
                                    placeholder="Revenue, CAC, Lead sources..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div>
                                <Label>Target Audience & Unmet Needs</Label>
                                <Textarea
                                    value={externalAudit.targetAudience}
                                    onChange={(e) => setExternalAudit({ ...externalAudit, targetAudience: e.target.value })}
                                    placeholder="ICP, Personas, and needs not being met..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div>
                                <Label>Competitors Analysis</Label>
                                <Textarea
                                    value={externalAudit.competitors}
                                    onChange={(e) => setExternalAudit({ ...externalAudit, competitors: e.target.value })}
                                    placeholder="Key competitors and their strategies..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Strengths</Label>
                                    <Textarea
                                        value={swot.strengths}
                                        onChange={(e) => setSwot({ ...swot, strengths: e.target.value })}
                                        placeholder="Internal positive factors..."
                                        className="mt-2 bg-zinc-950 border-zinc-800"
                                    />
                                </div>
                                <div>
                                    <Label>Weaknesses</Label>
                                    <Textarea
                                        value={swot.weaknesses}
                                        onChange={(e) => setSwot({ ...swot, weaknesses: e.target.value })}
                                        placeholder="Internal negative factors..."
                                        className="mt-2 bg-zinc-950 border-zinc-800"
                                    />
                                </div>
                                <div>
                                    <Label>Opportunities</Label>
                                    <Textarea
                                        value={swot.opportunities}
                                        onChange={(e) => setSwot({ ...swot, opportunities: e.target.value })}
                                        placeholder="External positive factors..."
                                        className="mt-2 bg-zinc-950 border-zinc-800"
                                    />
                                </div>
                                <div>
                                    <Label>Threats</Label>
                                    <Textarea
                                        value={swot.threats}
                                        onChange={(e) => setSwot({ ...swot, threats: e.target.value })}
                                        placeholder="External negative factors..."
                                        className="mt-2 bg-zinc-950 border-zinc-800"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* O - Objectives */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">2. O - Objectives</h3>

                        <div className="space-y-4">
                            <div>
                                <Label>Business Goals</Label>
                                <Textarea
                                    value={businessGoals}
                                    onChange={(e) => setBusinessGoals(e.target.value)}
                                    placeholder="Increase revenue by X%, achieve market share of Z%..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div>
                                <Label>SMART Marketing Objectives (3-5 goals)</Label>
                                {marketingObjectives.map((obj: string, index: number) => (
                                    <Input
                                        key={index}
                                        value={obj}
                                        onChange={(e) => {
                                            const newObjs = [...marketingObjectives]
                                            newObjs[index] = e.target.value
                                            setMarketingObjectives(newObjs)
                                        }}
                                        placeholder={`Objective ${index + 1}: e.g., Increase MQLs by 30% by Q3`}
                                        className="mt-2 bg-zinc-950 border-zinc-800"
                                    />
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* S - Strategy */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">3. S - Strategy</h3>

                        <div className="space-y-4">
                            <div>
                                <Label>Targeting & Positioning</Label>
                                <Textarea
                                    value={strategy.targeting}
                                    onChange={(e) => setStrategy({ ...strategy, targeting: e.target.value })}
                                    placeholder="Niche markets, geographic expansion..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div>
                                <Label>Competitive Advantage (How to Win)</Label>
                                <Textarea
                                    value={strategy.competitiveAdvantage}
                                    onChange={(e) => setStrategy({ ...strategy, competitiveAdvantage: e.target.value })}
                                    placeholder="How will you use strengths to overcome threats?"
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div>
                                <Label>Core Messaging</Label>
                                <Textarea
                                    value={strategy.coreMessaging}
                                    onChange={(e) => setStrategy({ ...strategy, coreMessaging: e.target.value })}
                                    placeholder="The key message you want your audience to remember..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div>
                                <Label>Pricing Strategy</Label>
                                <Input
                                    value={strategy.pricingStrategy}
                                    onChange={(e) => setStrategy({ ...strategy, pricingStrategy: e.target.value })}
                                    placeholder="Competitive, Value-based, Premium..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* T - Tactics */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">4. T - Tactics</h3>
                            <Button
                                onClick={addTactic}
                                size="sm"
                                className="bg-zinc-800 hover:bg-zinc-700"
                            >
                                <Plus size={14} className="mr-2" />
                                Add Tactic
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {tactics.map((tactic, index) => (
                                <div key={index} className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[#ccff00]">Tactic #{index + 1}</Label>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeTactic(index)}
                                            className="h-8 w-8"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs text-zinc-400">Channel</Label>
                                            <Input
                                                value={tactic.channel}
                                                onChange={(e) => updateTactic(index, "channel", e.target.value)}
                                                placeholder="e.g., Content Marketing, SEO"
                                                className="mt-1 bg-zinc-900 border-zinc-700"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-zinc-400">Purpose</Label>
                                            <Input
                                                value={tactic.purpose}
                                                onChange={(e) => updateTactic(index, "purpose", e.target.value)}
                                                placeholder="e.g., Lead Generation"
                                                className="mt-1 bg-zinc-900 border-zinc-700"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-xs text-zinc-400">Activity</Label>
                                            <Textarea
                                                value={tactic.activity}
                                                onChange={(e) => updateTactic(index, "activity", e.target.value)}
                                                placeholder="Detailed activity description..."
                                                className="mt-1 bg-zinc-900 border-zinc-700"
                                                rows={2}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-zinc-400">Budget</Label>
                                            <Input
                                                value={tactic.budget}
                                                onChange={(e) => updateTactic(index, "budget", e.target.value)}
                                                placeholder="$5,000"
                                                className="mt-1 bg-zinc-900 border-zinc-700"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-zinc-400">Owner</Label>
                                            <Input
                                                value={tactic.owner}
                                                onChange={(e) => updateTactic(index, "owner", e.target.value)}
                                                placeholder="Team/Person"
                                                className="mt-1 bg-zinc-900 border-zinc-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {tactics.length === 0 && (
                                <div className="text-center py-8 text-zinc-500 text-sm">
                                    No tactics added yet. Click "Add Tactic" to add your first one.
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* A - Action */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">5. A - Action</h3>

                        <div className="space-y-4">
                            <div>
                                <Label>Team Structure & Resources</Label>
                                <Textarea
                                    value={action.team}
                                    onChange={(e) => setAction({ ...action, team: e.target.value })}
                                    placeholder="RACI Matrix, hiring needs, MarTech requirements..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div>
                                <Label>Timeline & Milestones</Label>
                                <Textarea
                                    value={action.timeline}
                                    onChange={(e) => setAction({ ...action, timeline: e.target.value })}
                                    placeholder="Key tasks, start/end dates, owners..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div>
                                <Label>Sales & Marketing SLA</Label>
                                <Textarea
                                    value={action.sla}
                                    onChange={(e) => setAction({ ...action, sla: e.target.value })}
                                    placeholder="MQL/SQL definitions, handoff process..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* C - Control */}
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">6. C - Control</h3>

                        <div className="space-y-4">
                            <div>
                                <Label>Key Performance Indicators (KPIs)</Label>
                                {control.kpis.map((kpi: string, index: number) => (
                                    <Input
                                        key={index}
                                        value={kpi}
                                        onChange={(e) => {
                                            const newKpis = [...control.kpis]
                                            newKpis[index] = e.target.value
                                            setControl({ ...control, kpis: newKpis })
                                        }}
                                        placeholder={`KPI ${index + 1}: e.g., MQL to SQL conversion rate`}
                                        className="mt-2 bg-zinc-950 border-zinc-800"
                                    />
                                ))}
                            </div>

                            <div>
                                <Label>Measurement & Analytics</Label>
                                <Textarea
                                    value={control.measurement}
                                    onChange={(e) => setControl({ ...control, measurement: e.target.value })}
                                    placeholder="Analytics platforms, A/B testing approach..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>

                            <div>
                                <Label>Reporting Schedule</Label>
                                <Textarea
                                    value={control.reporting}
                                    onChange={(e) => setControl({ ...control, reporting: e.target.value })}
                                    placeholder="Weekly, monthly, quarterly reports and their focus..."
                                    className="mt-2 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Footer */}
                <div className="h-16 border-t border-zinc-900 flex items-center justify-end gap-3 px-6 bg-zinc-950">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-[#ccff00] text-black hover:bg-[#b3ff00]">
                        <Save size={16} className="mr-2" />
                        Save Strategy
                    </Button>
                </div>
            </div>
        </div>
    )
}

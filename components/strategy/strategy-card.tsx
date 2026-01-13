"use client"

import { Target, TrendingUp, DollarSign, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface StrategyCardProps {
    strategy: any
    onView: () => void
    onEdit: () => void
    onDelete: () => void
}

export function StrategyCard({ strategy, onView, onEdit, onDelete }: StrategyCardProps) {
    const executiveSummary = strategy.executive_summary || {}
    const marketAnalysis = strategy.market_analysis || {}
    const budget = strategy.budget || {}

    return (
        <Card className="bg-zinc-900 border-zinc-800 p-6 hover:border-[#a855f7]/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{strategy.name}</h3>
                    {executiveSummary.businessGoal && (
                        <p className="text-sm text-zinc-400 line-clamp-2 italic">
                            "{executiveSummary.businessGoal}"
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {/* Market Info */}
                {marketAnalysis.industry && (
                    <div className="flex items-center gap-2 text-sm">
                        <Target size={14} className="text-[#a855f7]" />
                        <span className="text-zinc-300">{marketAnalysis.industry}</span>
                        {marketAnalysis.companySize && (
                            <span className="text-zinc-500">• {marketAnalysis.companySize}</span>
                        )}
                    </div>
                )}

                {/* Budget */}
                {budget.total && (
                    <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={14} className="text-[#ccff00]" />
                        <span className="text-zinc-300">Budget: {budget.total}</span>
                    </div>
                )}

                {/* Goals Preview */}
                {executiveSummary.marketingGoals && executiveSummary.marketingGoals.length > 0 && (
                    <div className="pt-3 border-t border-zinc-800">
                        <p className="text-xs text-zinc-500 mb-2">Marketing Goals:</p>
                        <div className="space-y-1">
                            {executiveSummary.marketingGoals.slice(0, 2).map((goal: string, index: number) => (
                                <div key={index} className="text-xs text-zinc-400 flex items-start gap-2">
                                    <span className="text-[#ccff00] mt-0.5">✓</span>
                                    <span className="line-clamp-1">{goal}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* KPIs */}
                {strategy.kpis && strategy.kpis.length > 0 && (
                    <div className="pt-3 border-t border-zinc-800">
                        <p className="text-xs text-zinc-500 mb-2">Key Metrics:</p>
                        <div className="flex flex-wrap gap-1">
                            {strategy.kpis.slice(0, 4).map((kpi: string, index: number) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20"
                                >
                                    {kpi}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-xs text-zinc-600">
                    Created {new Date(strategy.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                    <Button onClick={onEdit} variant="outline" size="sm" className="text-xs">
                        Edit
                    </Button>
                    <Button onClick={onView} variant="default" size="sm" className="text-xs bg-[#a855f7] hover:bg-[#9333ea]">
                        View Details
                    </Button>
                </div>
            </div>
        </Card>
    )
}

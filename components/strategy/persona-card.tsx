"use client"

import { Eye, Edit, Trash2, Briefcase, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PersonaCardProps {
    persona: any
    onView: () => void
    onEdit: () => void
    onDelete: () => void
}

export function PersonaCard({ persona, onView, onEdit, onDelete }: PersonaCardProps) {
    const coreProfile = persona.core_profile || {}
    const professional = persona.professional || {}

    return (
        <Card className="bg-zinc-900 border-zinc-800 p-6 hover:border-[#ccff00]/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{persona.name}</h3>
                    {coreProfile.bio && (
                        <p className="text-sm text-zinc-400 italic line-clamp-2">"{coreProfile.bio}"</p>
                    )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onView}>
                        <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                        <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={onDelete}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {/* Demographics */}
                <div className="flex flex-wrap gap-2">
                    {coreProfile.ageRange && (
                        <Badge variant="outline" className="bg-zinc-950 text-zinc-300 border-zinc-700">
                            {coreProfile.ageRange}
                        </Badge>
                    )}
                    {coreProfile.gender && (
                        <Badge variant="outline" className="bg-zinc-950 text-zinc-300 border-zinc-700">
                            {coreProfile.gender}
                        </Badge>
                    )}
                    {coreProfile.location && (
                        <Badge variant="outline" className="bg-zinc-950 text-zinc-300 border-zinc-700 flex items-center gap-1">
                            <MapPin size={10} />
                            {coreProfile.location}
                        </Badge>
                    )}
                </div>

                {/* Professional Info */}
                {professional.jobTitle && (
                    <div className="flex items-center gap-2 text-sm">
                        <Briefcase size={14} className="text-[#ccff00]" />
                        <span className="text-zinc-300">{professional.jobTitle}</span>
                        {professional.industry && (
                            <span className="text-zinc-500">• {professional.industry}</span>
                        )}
                    </div>
                )}

                {/* Goals Preview */}
                {persona.goals?.primaryGoal && (
                    <div className="pt-3 border-t border-zinc-800">
                        <p className="text-xs text-zinc-500 mb-1">Primary Goal:</p>
                        <p className="text-sm text-zinc-300 line-clamp-2">{persona.goals.primaryGoal}</p>
                    </div>
                )}

                {/* Pain Points Preview */}
                {persona.goals?.painPoints && persona.goals.painPoints.length > 0 && (
                    <div className="pt-3 border-t border-zinc-800">
                        <p className="text-xs text-zinc-500 mb-2">Top Pain Points:</p>
                        <div className="flex flex-wrap gap-1">
                            {persona.goals.painPoints.slice(0, 3).map((point: string, index: number) => (
                                <span
                                    key={index}
                                    className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20"
                                >
                                    {point.length > 30 ? point.substring(0, 30) + "..." : point}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-xs text-zinc-600">
                    Created {new Date(persona.created_at).toLocaleDateString()}
                </span>
                <Button onClick={onView} variant="outline" size="sm" className="text-xs">
                    View Full Profile
                </Button>
            </div>
        </Card>
    )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, GitBranch } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export type Filter = {
    id: string
    field: string
    operator: string
    value: string
}

export type FilterGroup = {
    id: string
    logic: 'AND' | 'OR'
    filters: Filter[]
}

interface FilterBuilderProps {
    value: FilterGroup[]
    onChange: (groups: FilterGroup[]) => void
    triggerType?: string
    statusOptions?: any[]
}

// Logic Operators
const OPERATORS = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does not equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
]

// Available Fields based on Task Schema
const TASK_FIELDS = [
    { value: 'status', label: 'Status', type: 'select' }, // Options now dynamic
    { value: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'] },
    { value: 'title', label: 'Title', type: 'text' },
    { value: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'TikTok', 'LinkedIn'] },
    { value: 'ai_score', label: 'AI Score', type: 'number' },
]

export function FilterBuilder({ value, onChange, triggerType, statusOptions = [] }: FilterBuilderProps) {
    const addGroup = () => {
        const newGroup: FilterGroup = {
            id: crypto.randomUUID(),
            logic: 'AND',
            filters: [{ id: crypto.randomUUID(), field: 'status', operator: 'equals', value: '' }]
        }
        onChange([...value, newGroup])
    }

    const removeGroup = (groupId: string) => {
        onChange(value.filter(g => g.id !== groupId))
    }

    const addFilter = (groupId: string) => {
        const newGroups = value.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    filters: [...g.filters, { id: crypto.randomUUID(), field: 'priority', operator: 'equals', value: '' }]
                }
            }
            return g
        })
        onChange(newGroups)
    }

    const removeFilter = (groupId: string, filterId: string) => {
        const newGroups = value.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    filters: g.filters.filter(f => f.id !== filterId)
                }
            }
            return g
        })
        onChange(newGroups)
    }

    const updateFilter = (groupId: string, filterId: string, key: keyof Filter, val: string) => {
        const newGroups = value.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    filters: g.filters.map(f => f.id === filterId ? { ...f, [key]: val } : f)
                }
            }
            return g
        })
        onChange(newGroups)
    }

    const toggleGroupLogic = (groupId: string) => {
        const newGroups = value.map(g => {
            if (g.id === groupId) {
                return { ...g, logic: g.logic === 'AND' ? 'OR' : 'AND' } as FilterGroup
            }
            return g
        })
        onChange(newGroups)
    }

    return (
        <div className="space-y-4">
            {value.map((group, groupIndex) => (
                <div key={group.id} className="relative">
                    {groupIndex > 0 && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-800 text-[10px] font-bold px-2 py-0.5 rounded text-zinc-400 border border-zinc-700">
                            AND
                        </div>
                    )}

                    <div className="bg-zinc-950/30 border border-white/10 rounded-xl p-4 relative group/card hover:border-[var(--brand)]/30 transition-colors">
                        <div className="absolute -left-3 top-4 w-6 h-6 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center z-10">
                            <GitBranch className="w-3 h-3 text-emerald-500" />
                        </div>

                        <div className="flex items-center justify-between mb-3 pl-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Condition Group</span>
                                <button
                                    onClick={() => toggleGroupLogic(group.id)}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${group.logic === 'AND'
                                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                        : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                        }`}
                                >
                                    Match {group.logic}
                                </button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeGroup(group.id)}
                                className="h-6 w-6 p-0 text-zinc-500 hover:text-red-400"
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>

                        <div className="space-y-2 pl-4 border-l border-white/5 ml-3">
                            <AnimatePresence>
                                {group.filters.map((filter) => {
                                    const fieldDef = TASK_FIELDS.find(f => f.value === filter.field)
                                    // Determine options: dynamic if Status, static otherwise
                                    const options = filter.field === 'status'
                                        ? statusOptions.map(s => s.slug || s.name)
                                        : fieldDef?.options || []

                                    return (
                                        <motion.div
                                            key={filter.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Select value={filter.field} onValueChange={(v) => updateFilter(group.id, filter.id, 'field', v)}>
                                                <SelectTrigger className="h-8 w-[130px] bg-zinc-900 border-white/10 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TASK_FIELDS.map(f => (
                                                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Select value={filter.operator} onValueChange={(v) => updateFilter(group.id, filter.id, 'operator', v)}>
                                                <SelectTrigger className="h-8 w-[110px] bg-zinc-900 border-white/10 text-xs text-zinc-400">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {OPERATORS.map(op => (
                                                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <div className="flex-1">
                                                {options.length > 0 ? (
                                                    <Select value={filter.value} onValueChange={(v) => updateFilter(group.id, filter.id, 'value', v)}>
                                                        <SelectTrigger className="h-8 bg-zinc-900 border-white/10 text-xs">
                                                            <SelectValue placeholder="Select value..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {options.map((opt: string) => (
                                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        value={filter.value}
                                                        onChange={(e) => updateFilter(group.id, filter.id, 'value', e.target.value)}
                                                        className="h-8 bg-zinc-900 border-white/10 text-xs"
                                                        placeholder="Value..."
                                                    />
                                                )}
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFilter(group.id, filter.id)}
                                                className="h-8 w-8 p-0 text-zinc-600 hover:text-red-400"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addFilter(group.id)}
                                className="text-xs text-zinc-500 hover:text-white h-7 px-2 mt-2"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add Rule
                            </Button>
                        </div>
                    </div>
                </div>
            ))}

            <Button
                variant="outline"
                onClick={addGroup}
                className="w-full border-dashed border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700"
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Filter Group
            </Button>
        </div>
    )
}

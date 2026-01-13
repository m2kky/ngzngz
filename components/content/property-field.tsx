"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Type, Hash, List, CheckSquare, Link as LinkIcon, Mail, Plus, X, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type PropertyType = "text" | "number" | "select" | "multi-select" | "date" | "checkbox" | "url" | "email"

export interface PropertyDefinition {
    id: string
    name: string
    type: PropertyType
    options?: string[] // For select and multi-select
}

interface PropertyFieldProps {
    definition: PropertyDefinition
    value: any
    onChange: (value: any) => void
    onDefinitionUpdate?: (updatedDefinition: PropertyDefinition) => void
}

export const PROPERTY_ICONS: Record<PropertyType, any> = {
    text: Type,
    number: Hash,
    select: List,
    "multi-select": List,
    date: CalendarIcon,
    checkbox: CheckSquare,
    url: LinkIcon,
    email: Mail,
}

export function PropertyField({ definition, value, onChange, onDefinitionUpdate }: PropertyFieldProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")

    const handleAddOption = () => {
        if (!search.trim() || !onDefinitionUpdate) return

        const currentOptions = definition.options || []
        if (currentOptions.includes(search.trim())) return

        const updatedDefinition = {
            ...definition,
            options: [...currentOptions, search.trim()]
        }

        onDefinitionUpdate(updatedDefinition)

        // If it's single select, auto-select the new option
        if (definition.type === "select") {
            onChange(search.trim())
            setIsOpen(false)
        } else {
            // For multi-select, add to selection
            const currentValues = Array.isArray(value) ? value : []
            onChange([...currentValues, search.trim()])
        }
        setSearch("")
    }

    const filteredOptions = (definition.options || []).filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    )

    switch (definition.type) {
        case "text":
        case "url":
        case "email":
            return (
                <Input
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={`Empty ${definition.name}`}
                    className="h-8 bg-transparent border-transparent hover:border-zinc-800 focus:border-zinc-700 px-2 text-sm"
                />
            )
        case "number":
            return (
                <Input
                    type="number"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Empty"
                    className="h-8 bg-transparent border-transparent hover:border-zinc-800 focus:border-zinc-700 px-2 text-sm"
                />
            )
        case "checkbox":
            return (
                <div className="flex items-center h-8 px-2">
                    <Checkbox
                        checked={!!value}
                        onCheckedChange={onChange}
                        className="border-zinc-600 data-[state=checked]:bg-[#ccff00] data-[state=checked]:text-black"
                    />
                </div>
            )
        case "select":
            return (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-8 w-full justify-between px-2 text-sm font-normal hover:bg-zinc-900 border border-transparent hover:border-zinc-800">
                            {value || <span className="text-zinc-500">Select option</span>}
                            <ChevronDown size={14} className="opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-2 bg-zinc-950 border-zinc-800" align="start">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search or create..."
                            className="h-8 text-xs mb-2 bg-zinc-900 border-zinc-800"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddOption()
                            }}
                        />
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                            {filteredOptions.map((option) => (
                                <div
                                    key={option}
                                    onClick={() => {
                                        onChange(option)
                                        setIsOpen(false)
                                    }}
                                    className={cn(
                                        "flex items-center justify-between px-2 py-1.5 rounded-sm text-sm cursor-pointer hover:bg-zinc-900",
                                        value === option && "bg-zinc-900 text-[#ccff00]"
                                    )}
                                >
                                    {option}
                                    {value === option && <Check size={14} />}
                                </div>
                            ))}
                            {search && !filteredOptions.includes(search) && (
                                <div
                                    onClick={handleAddOption}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm cursor-pointer hover:bg-zinc-900 text-zinc-400"
                                >
                                    <Plus size={14} />
                                    Create "{search}"
                                </div>
                            )}
                            {filteredOptions.length === 0 && !search && (
                                <div className="text-xs text-zinc-500 px-2 py-2 text-center">
                                    Type to create options
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            )
        case "multi-select":
            const selectedValues = Array.isArray(value) ? value : []
            return (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <div className="min-h-[32px] w-full flex flex-wrap gap-1 p-1 rounded-md hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer transition-colors">
                            {selectedValues.length > 0 ? (
                                selectedValues.map((val: string) => (
                                    <Badge key={val} variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-[10px] h-5 px-1.5 font-normal">
                                        {val}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-zinc-500 text-sm px-1 self-center">Empty</span>
                            )}
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-2 bg-zinc-950 border-zinc-800" align="start">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search or create..."
                            className="h-8 text-xs mb-2 bg-zinc-900 border-zinc-800"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddOption()
                            }}
                        />
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                            {filteredOptions.map((option) => {
                                const isSelected = selectedValues.includes(option)
                                return (
                                    <div
                                        key={option}
                                        onClick={() => {
                                            const newValues = isSelected
                                                ? selectedValues.filter((v: string) => v !== option)
                                                : [...selectedValues, option]
                                            onChange(newValues)
                                        }}
                                        className={cn(
                                            "flex items-center justify-between px-2 py-1.5 rounded-sm text-sm cursor-pointer hover:bg-zinc-900",
                                            isSelected && "bg-zinc-900 text-[#ccff00]"
                                        )}
                                    >
                                        {option}
                                        {isSelected && <Check size={14} />}
                                    </div>
                                )
                            })}
                            {search && !filteredOptions.includes(search) && (
                                <div
                                    onClick={handleAddOption}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm cursor-pointer hover:bg-zinc-900 text-zinc-400"
                                >
                                    <Plus size={14} />
                                    Create "{search}"
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            )
        case "date":
            return (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"ghost"}
                            className={cn(
                                "h-8 w-full justify-start text-left font-normal px-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800",
                                !value && "text-muted-foreground"
                            )}
                        >
                            {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={value ? new Date(value) : undefined}
                            onSelect={(date) => onChange(date ? date.toISOString() : null)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            )
        default:
            return null
    }
}

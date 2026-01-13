"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Type, Hash, List, CheckSquare, Link as LinkIcon, Mail, Calendar } from "lucide-react"
import { PropertyDefinition, PropertyType, PROPERTY_ICONS } from "./property-field"

interface PropertyManagerProps {
    onAddProperty: (definition: PropertyDefinition) => void
}

export function PropertyManager({ onAddProperty }: PropertyManagerProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [newPropertyName, setNewPropertyName] = useState("")
    const [selectedType, setSelectedType] = useState<PropertyType | null>(null)

    const handleTypeSelect = (type: PropertyType) => {
        setSelectedType(type)
        setIsCreating(true)
        setNewPropertyName("")
    }

    const handleCreate = () => {
        if (!newPropertyName.trim() || !selectedType) return

        const newProperty: PropertyDefinition = {
            id: crypto.randomUUID(),
            name: newPropertyName,
            type: selectedType,
            options: selectedType === "select" ? ["Option 1", "Option 2"] : undefined, // Default options for now
        }

        onAddProperty(newProperty)
        setIsCreating(false)
        setSelectedType(null)
    }

    if (isCreating) {
        return (
            <div className="flex items-center gap-2 p-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    {PROPERTY_ICONS[selectedType!] && (() => {
                        const Icon = PROPERTY_ICONS[selectedType!]
                        return <Icon size={14} />
                    })()}
                </div>
                <Input
                    value={newPropertyName}
                    onChange={(e) => setNewPropertyName(e.target.value)}
                    placeholder="Property name..."
                    className="h-8 text-sm bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreate()
                        if (e.key === "Escape") setIsCreating(false)
                    }}
                />
                <Button size="sm" onClick={handleCreate} className="h-8 bg-[#ccff00] text-black hover:bg-[#b3ff00]">
                    Add
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)} className="h-8">
                    Cancel
                </Button>
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50">
                    <Plus size={14} className="mr-2" />
                    Add Property
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-zinc-950 border-zinc-800">
                <DropdownMenuItem onClick={() => handleTypeSelect("text")}>
                    <Type size={14} className="mr-2 text-zinc-400" />
                    Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTypeSelect("number")}>
                    <Hash size={14} className="mr-2 text-zinc-400" />
                    Number
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTypeSelect("select")}>
                    <List size={14} className="mr-2 text-zinc-400" />
                    Select
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTypeSelect("multi-select")}>
                    <List size={14} className="mr-2 text-zinc-400" />
                    Multi-select
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTypeSelect("date")}>
                    <Calendar size={14} className="mr-2 text-zinc-400" />
                    Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTypeSelect("checkbox")}>
                    <CheckSquare size={14} className="mr-2 text-zinc-400" />
                    Checkbox
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTypeSelect("url")}>
                    <LinkIcon size={14} className="mr-2 text-zinc-400" />
                    URL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTypeSelect("email")}>
                    <Mail size={14} className="mr-2 text-zinc-400" />
                    Email
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

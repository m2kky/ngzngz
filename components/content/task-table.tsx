"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/shared/status-badge"
import { PriorityBadge } from "@/components/shared/priority-badge"
import { PropertyDefinition, PROPERTY_ICONS } from "@/components/content/property-field"
import type { Database } from "@/types/database"
import { format } from "date-fns"
import { SortConfig, SortField } from "@/components/content/sort-control"
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

// ... imports

interface TaskTableProps {
    tasks: Task[]
    propertyDefinitions: PropertyDefinition[]
    onTaskClick: (task: Task) => void
    onUpdateProperty?: (id: string, updates: Partial<PropertyDefinition>) => void
    onDeleteProperty?: (id: string) => void
    onAddProperty?: (definition: Omit<PropertyDefinition, "id">) => void
    sortConfig?: SortConfig
    onSortChange?: (config: SortConfig) => void
}

export function TaskTable({
    tasks,
    propertyDefinitions,
    onTaskClick,
    onUpdateProperty,
    onDeleteProperty,
    onAddProperty,
    sortConfig,
    onSortChange
}: TaskTableProps) {
    const [isAddingProp, setIsAddingProp] = useState(false)
    const [newPropName, setNewPropName] = useState("")
    const [newPropType, setNewPropType] = useState<string>("text")

    const handleAddProperty = () => {
        if (!newPropName.trim() || !onAddProperty) return
        onAddProperty({
            name: newPropName,
            type: newPropType as any,
            options: []
        })
        setNewPropName("")
        setIsAddingProp(false)
    }

    const handleSort = (field: SortField) => {
        if (!onSortChange || !sortConfig) return

        if (sortConfig.field === field) {
            onSortChange({
                field,
                direction: sortConfig.direction === "asc" ? "desc" : "asc"
            })
        } else {
            onSortChange({
                field,
                direction: "desc"
            })
        }
    }

    const renderSortIcon = (field: SortField) => {
        if (sortConfig?.field !== field) return <ArrowUpDown size={14} className="ml-2 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        return sortConfig.direction === "asc" ?
            <ArrowUp size={14} className="ml-2 text-[var(--brand)]" /> :
            <ArrowDown size={14} className="ml-2 text-[var(--brand)]" />
    }

    return (
        <div className="rounded-md border border-zinc-800 bg-zinc-950/50">
            <Table>
                <TableHeader className="bg-zinc-900/50">
                    <TableRow className="hover:bg-transparent border-zinc-800">
                        <TableHead
                            className="w-[300px] cursor-pointer hover:text-white group transition-colors"
                            onClick={() => handleSort("title")}
                        >
                            <div className="flex items-center">
                                Task {renderSortIcon("title")}
                            </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead
                            className="cursor-pointer hover:text-white group transition-colors"
                            onClick={() => handleSort("priority")}
                        >
                            <div className="flex items-center">
                                Priority {renderSortIcon("priority")}
                            </div>
                        </TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead
                            className="cursor-pointer hover:text-white group transition-colors"
                            onClick={() => handleSort("due_date")}
                        >
                            <div className="flex items-center">
                                Due Date {renderSortIcon("due_date")}
                            </div>
                        </TableHead>
                        {propertyDefinitions.map((def) => (
                            <TableHead key={def.id} className="min-w-[150px] group">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 -ml-2 data-[state=open]:bg-zinc-800"
                                        >
                                            <div className="flex items-center gap-2">
                                                {PROPERTY_ICONS[def.type] && (() => {
                                                    const Icon = PROPERTY_ICONS[def.type]
                                                    return <Icon size={14} className="text-zinc-500" />
                                                })()}
                                                {def.name}
                                            </div>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-4 bg-zinc-950 border-zinc-800" align="start">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-sm text-zinc-400">Edit Property</h4>
                                                <Input
                                                    value={def.name}
                                                    onChange={(e) => onUpdateProperty?.(def.id, { name: e.target.value })}
                                                    className="bg-zinc-900 border-zinc-800"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-sm text-zinc-400">Type</h4>
                                                <Select
                                                    value={def.type}
                                                    onValueChange={(value) => onUpdateProperty?.(def.id, { type: value as any })}
                                                >
                                                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                                        <SelectItem value="text">Text</SelectItem>
                                                        <SelectItem value="number">Number</SelectItem>
                                                        <SelectItem value="select">Select</SelectItem>
                                                        <SelectItem value="multi-select">Multi-Select</SelectItem>
                                                        <SelectItem value="date">Date</SelectItem>
                                                        <SelectItem value="checkbox">Checkbox</SelectItem>
                                                        <SelectItem value="url">URL</SelectItem>
                                                        <SelectItem value="email">Email</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="pt-2 border-t border-zinc-800">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDeleteProperty?.(def.id)}
                                                    className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                >
                                                    <Trash2 size={14} className="mr-2" />
                                                    Delete Property
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </TableHead>
                        ))}
                        <TableHead className="w-[50px]">
                            <Popover open={isAddingProp} onOpenChange={setIsAddingProp}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-200">
                                        <Plus size={14} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4 bg-zinc-950 border-zinc-800" align="start">
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-sm text-zinc-200">New Property</h4>
                                        <Input
                                            placeholder="Property name"
                                            value={newPropName}
                                            onChange={(e) => setNewPropName(e.target.value)}
                                            className="bg-zinc-900 border-zinc-800"
                                        />
                                        <Select value={newPropType} onValueChange={setNewPropType}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="select">Select</SelectItem>
                                                <SelectItem value="multi-select">Multi-Select</SelectItem>
                                                <SelectItem value="date">Date</SelectItem>
                                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                                <SelectItem value="url">URL</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            onClick={handleAddProperty}
                                            className="w-full bg-[#ccff00] text-black hover:bg-[#b3ff00]"
                                        >
                                            Create Property
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow
                            key={task.id}
                            className="border-zinc-800 hover:bg-zinc-900/50 cursor-pointer group"
                            onClick={() => onTaskClick(task)}
                        >
                            <TableCell className="font-medium text-zinc-200">
                                {task.title}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={task.status || "TODO"} />
                            </TableCell>
                            <TableCell>
                                <PriorityBadge priority={task.priority || "MEDIUM"} />
                            </TableCell>
                            <TableCell>
                                {task.assignee_id ? (
                                    <img
                                        src={`https://i.pravatar.cc/150?u=${task.assignee_id}`}
                                        className="w-6 h-6 rounded-full"
                                        alt="Assignee"
                                    />
                                ) : (
                                    <span className="text-zinc-600 text-xs">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-zinc-400 text-sm">
                                {task.due_date ? format(new Date(task.due_date), "MMM d") : "-"}
                            </TableCell>
                            {propertyDefinitions.map((def) => {
                                const value = (task.properties as any)?.[def.id]
                                return (
                                    <TableCell key={def.id} className="text-zinc-400 text-sm">
                                        {renderPropertyValue(value, def.type)}
                                    </TableCell>
                                )
                            })}
                            <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal size={14} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function renderPropertyValue(value: any, type: string) {
    if (!value) return "-"

    switch (type) {
        case "date":
            return format(new Date(value), "MMM d, yyyy")
        case "checkbox":
            return value ? "Yes" : "No"
        case "multi-select":
            return Array.isArray(value) ? value.join(", ") : value
        default:
            return String(value)
    }
}


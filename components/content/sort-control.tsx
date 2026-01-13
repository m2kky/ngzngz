"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { ArrowDownAZ, ArrowUpAZ, Calendar, Clock, SortAsc, SortDesc } from "lucide-react"

export type SortField = "title" | "priority" | "due_date" | "created_at"
export type SortDirection = "asc" | "desc"

export interface SortConfig {
    field: SortField
    direction: SortDirection
}

interface SortControlProps {
    sortConfig: SortConfig
    onSortChange: (config: SortConfig) => void
}

export function SortControl({ sortConfig, onSortChange }: SortControlProps) {
    const handleFieldChange = (field: string) => {
        onSortChange({ ...sortConfig, field: field as SortField })
    }

    const toggleDirection = () => {
        onSortChange({
            ...sortConfig,
            direction: sortConfig.direction === "asc" ? "desc" : "asc"
        })
    }

    const getSortLabel = (field: SortField) => {
        switch (field) {
            case "title": return "Title"
            case "priority": return "Priority"
            case "due_date": return "Due Date"
            case "created_at": return "Created Date"
            default: return field
        }
    }

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed glass-card hover:bg-white/5">
                        <SortAsc className="mr-2 h-4 w-4 text-zinc-400" />
                        Sort by {getSortLabel(sortConfig.field)}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] glass-panel">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={sortConfig.field} onValueChange={handleFieldChange}>
                        <DropdownMenuRadioItem value="title">Title</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="due_date">Due Date</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="created_at">Created Date</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white/5"
                onClick={toggleDirection}
                title={`Sort ${sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'}`}
            >
                {sortConfig.direction === "asc" ? (
                    <ArrowDownAZ className="h-4 w-4 text-zinc-400" />
                ) : (
                    <ArrowUpAZ className="h-4 w-4 text-zinc-400" />
                )}
            </Button>
        </div>
    )
}

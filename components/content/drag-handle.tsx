"use client"

import { useState, useEffect } from "react"
import { Editor } from "@tiptap/react"
import { GripVertical, Plus } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface DragHandleProps {
    editor: Editor
}

export function DragHandle({ editor }: DragHandleProps) {
    const [position, setPosition] = useState<number | null>(null)
    const [top, setTop] = useState<number>(0)
    const [left, setLeft] = useState<number>(0)

    useEffect(() => {
        const editorElement = editor.options.element as HTMLElement

        if (!editorElement) return

        const handleMouseMove = (e: MouseEvent) => {
            const coords = {
                left: e.clientX,
                top: e.clientY,
            }

            // Find the node at these coordinates
            const pos = editor.view.posAtCoords(coords)
            if (!pos) return

            // Resolve the node at this position
            const node = editor.view.domAtPos(pos.pos).node as HTMLElement

            // We want the block level element
            let blockElement = node
            if (node.nodeType === 3) { // Text node
                blockElement = node.parentElement as HTMLElement
            }

            // Walk up until we find a direct child of the editor
            while (blockElement && blockElement.parentElement !== editorElement) {
                blockElement = blockElement.parentElement as HTMLElement
            }

            if (blockElement && blockElement.getBoundingClientRect) {
                const rect = blockElement.getBoundingClientRect()
                const editorRect = editorElement.getBoundingClientRect()

                setTop(rect.top - editorRect.top)
                setLeft(-24) // Position to the left
                setPosition(pos.pos)
            }
        }

        editorElement.addEventListener("mousemove", handleMouseMove)
        return () => {
            editorElement.removeEventListener("mousemove", handleMouseMove)
        }
    }, [editor])

    if (position === null) return null

    return (
        <div
            className="absolute w-6 h-6 flex items-center justify-center cursor-grab text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors z-50"
            style={{
                top: `${top}px`,
                left: `${left}px`,
                transform: 'translateY(2px)' // Fine-tuning
            }}
            draggable="true"
            onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", "drag-handle")
                e.dataTransfer.effectAllowed = "move"
                // We would set the drag image here
            }}
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="w-full h-full flex items-center justify-center">
                        <GripVertical size={14} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-zinc-950 border-zinc-800 text-zinc-200">
                    <DropdownMenuItem onClick={() => editor.chain().focus().deleteSelection().run()} className="text-red-400 focus:text-red-400 focus:bg-red-950/20">
                        <Plus className="mr-2 h-4 w-4 rotate-45" />
                        Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleBold().run()}>
                        Bold
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleItalic().run()}>
                        Italic
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

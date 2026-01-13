"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"

import { SlashCommand } from "./slash-command"
import { DragHandle } from "./drag-handle"
import { cn } from "@/lib/utils"

interface BlockEditorProps {
    content: any
    onChange: (content: any) => void
}

export function BlockEditor({ content, onChange }: BlockEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Placeholder.configure({
                placeholder: "Press '/' for commands or start typing...",
                includeChildren: true,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Youtube.configure({
                controls: false,
            }),
            SlashCommand,
        ],
        content: content || "",
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-invert max-w-none focus:outline-none min-h-[300px]",
                    "prose-p:text-zinc-300 prose-headings:text-zinc-100 prose-headings:font-bold",
                    "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
                    "prose-code:bg-zinc-900 prose-code:text-[#ccff00] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
                    "prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800",
                    "prose-strong:text-[#ccff00]",
                    "prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4",
                    "prose-li:marker:text-zinc-500",
                    "prose-blockquote:border-l-2 prose-blockquote:border-[#ccff00] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-400",
                    "prose-img:rounded-lg prose-img:border prose-img:border-zinc-800",
                    "[&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']]:pl-0",
                    "[&_li[data-type='taskItem']]:flex [&_li[data-type='taskItem']]:gap-2 [&_li[data-type='taskItem']]:items-start [&_li[data-type='taskItem']]:my-1",
                    "[&_input[type='checkbox']]:appearance-none [&_input[type='checkbox']]:w-4 [&_input[type='checkbox']]:h-4 [&_input[type='checkbox']]:border [&_input[type='checkbox']]:border-zinc-700 [&_input[type='checkbox']]:rounded [&_input[type='checkbox']]:bg-zinc-900 [&_input[type='checkbox']]:checked:bg-[#ccff00] [&_input[type='checkbox']]:checked:border-[#ccff00] [&_input[type='checkbox']]:cursor-pointer [&_input[type='checkbox']]:mt-1"
                ),
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON())
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/50 relative group/editor">
            <div className="absolute left-4 top-0 bottom-0 w-6 z-40">
                {/* Drag handle area */}
                <DragHandle editor={editor} />
            </div>
            <div className="p-4 pl-12 min-h-[300px] cursor-text" onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}

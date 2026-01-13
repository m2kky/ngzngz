"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Placeholder from "@tiptap/extension-placeholder"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, CheckSquare, Plus } from "lucide-react"
import { toast } from "sonner"

interface MeetingNotesEditorProps {
    meetingId: string
}

export function MeetingNotesEditor({ meetingId }: MeetingNotesEditorProps) {
    const [noteId, setNoteId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    const editor = useEditor({
        extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder: 'Start typing your meeting notes...',
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] text-zinc-200',
            },
        },
        onUpdate: ({ editor }) => {
            // Auto-save after 2 seconds of inactivity
            if (autoSaveTimeout) clearTimeout(autoSaveTimeout)
            autoSaveTimeout = setTimeout(() => {
                handleSave()
            }, 2000)
        },
    })

    let autoSaveTimeout: NodeJS.Timeout

    useEffect(() => {
        loadNotes()
        return () => {
            if (autoSaveTimeout) clearTimeout(autoSaveTimeout)
        }
    }, [meetingId])

    const loadNotes = async () => {
        try {
            const { data, error } = await supabase
                .from('meeting_notes')
                .select('*')
                .eq('meeting_id', meetingId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (data) {
                setNoteId(data.id)
                editor?.commands.setContent(data.content || '')
            }
        } catch (error) {
            // No notes yet, that's fine
            console.log('No existing notes')
        }
    }

    const handleSave = async () => {
        if (!editor) return

        setSaving(true)
        try {
            const content = editor.getHTML()
            const { data: { user } } = await supabase.auth.getUser()

            if (noteId) {
                // Update existing note
                const { error } = await supabase
                    .from('meeting_notes')
                    .update({ content, updated_at: new Date().toISOString() })
                    .eq('id', noteId)

                if (error) throw error
            } else {
                // Create new note
                const { data, error } = await supabase
                    .from('meeting_notes')
                    .insert({
                        meeting_id: meetingId,
                        content,
                        author_id: user?.id
                    })
                    .select()
                    .single()

                if (error) throw error
                if (data) setNoteId(data.id)
            }
        } catch (error: any) {
            console.error('Error saving notes:', error)
            toast.error('Failed to save notes')
        } finally {
            setSaving(false)
        }
    }

    const handleConvertToTask = async () => {
        if (!editor) return

        const { from, to } = editor.state.selection
        const selectedText = editor.state.doc.textBetween(from, to, ' ')

        if (!selectedText) {
            toast.error("Please select text to convert to a task")
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1)

            if (!workspaces || workspaces.length === 0) {
                toast.error("No workspace found")
                return
            }

            const { error } = await supabase
                .from('tasks')
                .insert({
                    workspace_id: workspaces[0].id,
                    title: selectedText.substring(0, 255), // Limit to 255 chars
                    description: `Created from meeting notes`,
                    status: 'DRAFTING',
                    priority: 'MEDIUM',
                    created_by: user?.id
                })

            if (error) throw error
            toast.success("Task created successfully!")
        } catch (error: any) {
            console.error('Error creating task:', error)
            toast.error(`Failed to create task: ${error.message}`)
        }
    }

    if (!editor) {
        return <div className="text-zinc-400">Loading editor...</div>
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg flex-wrap">
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-white/10' : ''}
                >
                    <Bold size={16} />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-white/10' : ''}
                >
                    <Italic size={16} />
                </Button>
                <div className="w-px h-6 bg-white/20 mx-1" />
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-white/10' : ''}
                >
                    <List size={16} />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'bg-white/10' : ''}
                >
                    <ListOrdered size={16} />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    className={editor.isActive('taskList') ? 'bg-white/10' : ''}
                >
                    <CheckSquare size={16} />
                </Button>
                <div className="w-px h-6 bg-white/20 mx-1" />
                <Button
                    type="button"
                    size="sm"
                    onClick={handleConvertToTask}
                    className="bg-[var(--brand)]/20 text-[var(--brand)] hover:bg-[var(--brand)]/30"
                >
                    <Plus size={14} className="mr-1" />
                    Convert to Task
                </Button>
                <div className="ml-auto text-xs text-zinc-500">
                    {saving ? 'Saving...' : 'Auto-saved'}
                </div>
            </div>

            {/* Editor */}
            <div className="bg-white/5 rounded-xl p-4 min-h-[400px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}

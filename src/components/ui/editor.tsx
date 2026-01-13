import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import { cn } from '@/lib/utils'

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
  placeholder?: string;
}

export function Editor({ value, onChange, editable = true, placeholder = 'Start writing...' }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Typography,
    ],
    content: value,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px]',
          'prose-headings:font-semibold prose-headings:mb-2 prose-headings:mt-6',
          'prose-p:my-2 prose-p:leading-relaxed',
          'prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4',
          'prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-4',
          'prose-li:my-0.5',
          'prose-blockquote:border-l-4 prose-blockquote:border-muted prose-blockquote:pl-4 prose-blockquote:italic',
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update content if value changes externally (and editor is not focused, to avoid cursor jumps)
  // Note: This is a simplified approach. Ideally we'd compare content.
  /* 
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor]) 
  */

  if (!editor) {
    return null
  }

  return (
    <div className={cn("relative w-full", editable ? "" : "pointer-events-none")}>
      <EditorContent editor={editor} />
    </div>
  )
}

import { Extension } from "@tiptap/core"
import Suggestion from "@tiptap/suggestion"
import { ReactRenderer } from "@tiptap/react"
import tippy from "tippy.js"
import {
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Code,
    Type,
    CheckSquare,
} from "lucide-react"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"

const CommandList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props.items[index]
        if (item) {
            props.command(item)
        }
    }

    useEffect(() => {
        setSelectedIndex(0)
    }, [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === "ArrowUp") {
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
                return true
            }
            if (event.key === "ArrowDown") {
                setSelectedIndex((selectedIndex + 1) % props.items.length)
                return true
            }
            if (event.key === "Enter") {
                selectItem(selectedIndex)
                return true
            }
            return false
        },
    }))

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl overflow-hidden min-w-[200px] p-1 animate-in fade-in zoom-in-95 duration-100">
            {props.items.length ? (
                props.items.map((item: any, index: number) => (
                    <button
                        key={index}
                        className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left rounded-md transition-colors ${index === selectedIndex
                            ? "bg-zinc-900 text-[#ccff00]"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                            }`}
                        onClick={() => selectItem(index)}
                    >
                        <div className={`p-1 rounded ${index === selectedIndex ? "bg-[#ccff00]/10" : "bg-zinc-900"}`}>
                            {item.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            {/* <span className="text-[10px] text-zinc-500">{item.description}</span> */}
                        </div>
                    </button>
                ))
            ) : (
                <div className="px-2 py-1 text-sm text-zinc-500">No result</div>
            )}
        </div>
    )
})

CommandList.displayName = "CommandList"

const renderItems = () => {
    let component: ReactRenderer | null = null
    let popup: any | null = null

    return {
        onStart: (props: any) => {
            component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
            })

            if (!props.clientRect) {
                return
            }

            popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
            })
        },
        onUpdate: (props: any) => {
            component?.updateProps(props)

            if (!props.clientRect) {
                return
            }

            popup?.[0].setProps({
                getReferenceClientRect: props.clientRect,
            })
        },
        onKeyDown: (props: any) => {
            if (props.event.key === "Escape") {
                popup?.[0].hide()
                return true
            }
            return (component?.ref as any)?.onKeyDown(props)
        },
        onExit: () => {
            popup?.[0].destroy()
            component?.destroy()
        },
    }
}

const Commands = Extension.create({
    name: "slash-command",

    addOptions() {
        return {
            suggestion: {
                char: "/",
                command: ({ editor, range, props }: any) => {
                    props.command({ editor, range })
                },
            },
        }
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ]
    },
})

export const getSuggestionItems = ({ query }: { query: string }) => {
    return [
        {
            title: "Text",
            description: "Just start typing with plain text.",
            icon: <Type size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode("paragraph").run()
            },
        },
        {
            title: "Heading 1",
            description: "Big section heading.",
            icon: <Heading1 size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run()
            },
        },
        {
            title: "Heading 2",
            description: "Medium section heading.",
            icon: <Heading2 size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run()
            },
        },
        {
            title: "Heading 3",
            description: "Small section heading.",
            icon: <Heading3 size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run()
            },
        },
        {
            title: "Bullet List",
            description: "Create a simple bullet list.",
            icon: <List size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run()
            },
        },
        {
            title: "Numbered List",
            description: "Create a list with numbering.",
            icon: <ListOrdered size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
            },
        },
        {
            title: "Code Block",
            description: "Capture a code snippet.",
            icon: <Code size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
            },
        },
        {
            title: "To-do List",
            description: "Track tasks with a to-do list.",
            icon: <CheckSquare size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleTaskList().run()
            },
        },
        {
            title: "Quote",
            description: "Capture a quote.",
            icon: <div className="text-sm font-serif px-1">"</div>,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run()
            },
        },
        {
            title: "Divider",
            description: "Visually divide content.",
            icon: <div className="text-xs">---</div>,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setHorizontalRule().run()
            },
        },
        {
            title: "Image",
            description: "Embed an image from URL.",
            icon: <div className="text-xs">IMG</div>,
            command: ({ editor, range }: any) => {
                const url = window.prompt("Enter image URL:")
                if (url) {
                    editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
                }
            },
        },
        {
            title: "Youtube",
            description: "Embed a Youtube video.",
            icon: <div className="text-xs">YT</div>,
            command: ({ editor, range }: any) => {
                const url = window.prompt("Enter Youtube URL:")
                if (url) {
                    editor.chain().focus().deleteRange(range).setYoutubeVideo({ src: url }).run()
                }
            },
        },
    ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
}

export const SlashCommand = Commands.configure({
    suggestion: {
        items: getSuggestionItems,
        render: renderItems,
    },
})

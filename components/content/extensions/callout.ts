import { Node, mergeAttributes } from "@tiptap/core"

export interface CalloutOptions {
    HTMLAttributes: Record<string, any>
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        callout: {
            toggleCallout: () => ReturnType
            setCallout: () => ReturnType
        }
    }
}

export const Callout = Node.create<CalloutOptions>({
    name: "callout",

    addOptions() {
        return {
            HTMLAttributes: {
                class: "callout",
            },
        }
    },

    content: "block+",

    group: "block",

    defining: true,

    parseHTML() {
        return [
            {
                tag: "div[data-type='callout']",
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "div",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { "data-type": "callout" }),
            ["span", { class: "callout-icon", contenteditable: "false" }, "💡"],
            ["div", { class: "callout-content" }, 0],
        ]
    },

    addCommands() {
        return {
            toggleCallout:
                () =>
                ({ commands }) => {
                    return commands.toggleWrap(this.name)
                },
            setCallout:
                () =>
                ({ commands }) => {
                    return commands.wrapIn(this.name)
                },
        }
    },
})

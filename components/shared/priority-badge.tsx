interface PriorityBadgeProps {
    priority: string
    size?: "xs" | "sm" | "md"
}

const PRIORITY_STYLES = {
    HIGH: "text-red-400 bg-red-400/10 border-red-400/20",
    URGENT: "text-red-600 bg-red-600/10 border-red-600/20",
    MEDIUM: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    LOW: "text-zinc-400 bg-zinc-800 border-zinc-700",
} as const

export function PriorityBadge({ priority, size = "sm" }: PriorityBadgeProps) {
    const style = PRIORITY_STYLES[priority as keyof typeof PRIORITY_STYLES] || PRIORITY_STYLES.LOW
    const sizeClasses = size === "xs" ? "text-[8px] px-1 py-0" : "text-[10px] px-1.5 py-0.5"

    return (
        <span className={`rounded border ${style} ${sizeClasses}`}>
            {priority}
        </span>
    )
}

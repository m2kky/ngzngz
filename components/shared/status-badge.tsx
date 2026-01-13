interface StatusBadgeProps {
    status: string
    size?: "xs" | "sm" | "md"
}

const STATUS_STYLES = {
    DRAFTING: "bg-zinc-800 text-zinc-400 border-zinc-700",
    IN_PROGRESS: "bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20",
    AI_CHECK: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    INTERNAL_REVIEW: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    CLIENT_REVIEW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    APPROVED: "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20",
    PUBLISHED: "bg-green-500/10 text-green-500 border-green-500/20",
    ADS_HANDOFF: "bg-orange-500/10 text-orange-500 border-orange-500/20",
} as const

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
    const style = STATUS_STYLES[status as keyof typeof STATUS_STYLES] || STATUS_STYLES.DRAFTING
    const sizeClasses = size === "xs" ? "text-[8px] px-1 py-0" : "text-[10px] px-2 py-0.5"

    return (
        <span className={`rounded font-bold border ${style} ${sizeClasses}`}>
            {status.replace(/_/g, ' ')}
        </span>
    )
}

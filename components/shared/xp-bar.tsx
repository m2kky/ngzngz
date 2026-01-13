interface XPBarProps {
    xp: number
    level: number
}

export function XPBar({ xp, level }: XPBarProps) {
    const levelThreshold = level * 500
    const progress = (xp % levelThreshold) / levelThreshold * 100

    return (
        <div className="flex items-center space-x-3 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
            <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Ninja Level {level}
                </span>
                <div className="w-32 h-2 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                    <div
                        className="h-full bg-[var(--brand)] shadow-[0_0_10px_var(--brand)] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            <span className="text-[var(--brand)] font-mono text-xs font-bold">{xp} XP</span>
        </div>
    )
}

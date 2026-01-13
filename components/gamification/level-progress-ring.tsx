"use client"

interface LevelProgressRingProps {
    currentXP: number
    level: number
    size?: number
}

export function LevelProgressRing({ currentXP, level, size = 120 }: LevelProgressRingProps) {
    // Calculate XP for current level
    const xpForCurrentLevel = (level - 1) * 1000
    const xpForNextLevel = level * 1000
    const xpInCurrentLevel = currentXP - xpForCurrentLevel
    const xpNeededForLevel = 1000

    // Calculate progress percentage (0-100)
    const progress = (xpInCurrentLevel / xpNeededForLevel) * 100

    // SVG circle parameters
    const strokeWidth = 8
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
        <div className="relative" style={{ width: size, height: size }}>
            {/* Background circle */}
            <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 drop-shadow-[0_0_8px_var(--brand)]"
                />
            </svg>

            {/* Center content - Level number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-white">{level}</div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Level</div>
            </div>

            {/* XP tooltip on hover */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-xs text-zinc-400 whitespace-nowrap">
                    {xpInCurrentLevel}/{xpNeededForLevel} XP
                </div>
            </div>
        </div>
    )
}

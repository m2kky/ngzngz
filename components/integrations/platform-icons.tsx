// Platform Icon Components

export function MetaIcon({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="url(#metaGradient)" />
            <path
                d="M16 8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2s2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2s2-.9 2-2v-4c0-1.1-.9-2-2-2z"
                fill="white"
            />
            <defs>
                <linearGradient id="metaGradient" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#0866FF" />
                    <stop offset="100%" stopColor="#00E0FF" />
                </linearGradient>
            </defs>
        </svg>
    )
}

export function TikTokIcon({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="black" />
            <path
                d="M17 7.5c-1.4-1-2.3-2.5-2.5-4.5h-3v13c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .5 0 .8.1V10c-.3 0-.5 0-.8 0-3 0-5.5 2.5-5.5 5.5S6 21 9 21s5.5-2.5 5.5-5.5V8c1.5 1 3.2 1.5 5 1.5V6.5c-1 0-2-.4-2.5-1z"
                fill="url(#tiktokGradient)"
            />
            <defs>
                <linearGradient id="tiktokGradient" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#00F2EA" />
                    <stop offset="100%" stopColor="#FF0050" />
                </linearGradient>
            </defs>
        </svg>
    )
}

export function GoogleAdsIcon({ size = 24 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
                d="M12 2L2 20h4l6-10.4L18 20h4L12 2z"
                fill="url(#googleGradient)"
            />
            <circle cx="12" cy="12" r="3" fill="#FBBC04" />
            <defs>
                <linearGradient id="googleGradient" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#4285F4" />
                    <stop offset="50%" stopColor="#34A853" />
                    <stop offset="100%" stopColor="#EA4335" />
                </linearGradient>
            </defs>
        </svg>
    )
}

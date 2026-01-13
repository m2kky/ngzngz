"use client"

import { useState, useEffect } from "react"
import { UserAvatarUpload } from "@/components/profile/user-avatar-upload"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Palette } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const THEME_COLORS = [
    { name: "Neon Lime", value: "#ccff00" },
    { name: "Electric Blue", value: "#00d4ff" },
    { name: "Hot Pink", value: "#ff006e" },
    { name: "Purple Haze", value: "#a855f7" },
    { name: "Cyber Orange", value: "#ff6b00" },
    { name: "Mint Green", value: "#00ffa3" },
]

export default function ProfileSettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [fullName, setFullName] = useState("")
    const [nickname, setNickname] = useState("")
    const [bio, setBio] = useState("")
    const [birthDate, setBirthDate] = useState<Date>()
    const [themeColor, setThemeColor] = useState("#ccff00")
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const supabase = createClient() as any

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

        if (data) {
            setUser(data)
            setFullName(data.full_name || "")
            setNickname(data.nickname || "")
            setBio(data.bio || "")
            setThemeColor(data.theme_color || "#ccff00")
            setAvatarUrl(data.avatar_url)
            if (data.birth_date) {
                setBirthDate(new Date(data.birth_date))
            }
        }
    }

    const handleSave = async () => {
        if (!user) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: fullName,
                    nickname: nickname || null,
                    bio: bio || null,
                    birth_date: birthDate ? format(birthDate, 'yyyy-MM-dd') : null,
                    theme_color: themeColor,
                    avatar_url: avatarUrl,
                } as any)
                .eq('id', user.id)

            if (error) throw error

            toast.success("Profile updated successfully!")

            // Update root CSS variable for theme color
            document.documentElement.style.setProperty('--brand', themeColor)
        } catch (error: any) {
            console.error('Save error:', error)
            toast.error(`Failed to save profile: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-zinc-400">Loading...</div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-auto p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
                    <p className="text-zinc-400">Manage your personal information and preferences</p>
                </div>

                {/* Main Card */}
                <div className="glass-panel p-8 rounded-2xl space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center pb-6 border-b border-white/10">
                        <UserAvatarUpload
                            currentAvatar={avatarUrl}
                            userName={user.full_name}
                            userId={user.id}
                            onUploadComplete={(url) => setAvatarUrl(url)}
                        />
                    </div>

                    {/* Identity Form */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            👤 Identity
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-white">Full Name</label>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="bg-white/5 border-white/20 text-white"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-white">Nickname</label>
                                <Input
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="bg-white/5 border-white/20 text-white"
                                    placeholder="Display name for chats"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white">Ninja Motto / Bio</label>
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="bg-white/5 border-white/20 text-white min-h-[100px]"
                                placeholder="Share your ninja motto or a short bio..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white">Birth Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-white/5 border-white/20 text-white hover:bg-white/10",
                                            !birthDate && "text-zinc-400"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {birthDate ? format(birthDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 glass-panel border-white/20">
                                    <Calendar
                                        mode="single"
                                        selected={birthDate}
                                        onSelect={setBirthDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Theme Personalization */}
                    <div className="space-y-6 pt-6 border-t border-white/10">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Palette size={20} className="text-[var(--brand)]" />
                            Ninja Theme Color
                        </h2>

                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {THEME_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setThemeColor(color.value)}
                                    className={cn(
                                        "relative aspect-square rounded-lg border-2 transition-all hover:scale-105",
                                        themeColor === color.value
                                            ? "border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105"
                                            : "border-white/20"
                                    )}
                                    style={{ backgroundColor: color.value }}
                                >
                                    {themeColor === color.value && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                                <div className="w-3 h-3 rounded-full bg-black" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-zinc-400">
                                Selected: <span className="font-mono text-white">{themeColor}</span>
                            </p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-[var(--brand)] text-black hover:opacity-90 font-bold text-lg h-12"
                        style={{ backgroundColor: themeColor }}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

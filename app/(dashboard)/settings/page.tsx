"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { Moon, Sun, Laptop } from "lucide-react"

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [workspace, setWorkspace] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const supabase = createClient() as any
    const { setTheme } = useTheme()

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                // Fetch workspace (assuming single workspace for MVP)
                const { data: workspaces } = await supabase
                    .from("workspaces")
                    .select("*")
                    .limit(1)

                if (workspaces && workspaces.length > 0) {
                    setWorkspace(workspaces[0])
                }
            }
        }
        fetchData()
    }, [supabase])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, bucket: "avatars" | "logos") => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        setLoading(true)
        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file)

        if (uploadError) {
            toast.error("Error uploading image")
            setLoading(false)
            return
        }

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath)

        if (bucket === "avatars") {
            // 1. Update Auth Metadata
            const { data: authData, error: authError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            })

            if (authError) {
                toast.error("Failed to update avatar: " + authError.message)
                setLoading(false)
                return
            }

            // 2. Upsert public record
            const { error: updateError } = await supabase
                .from("users")
                .upsert({
                    email: user.email,
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                } as any, { onConflict: 'email' })

            if (updateError) {
                console.error("DB Avatar Error:", updateError)
            }

            setUser(authData.user)
            toast.success("Avatar updated!")
        } else {
            setWorkspace({ ...workspace, logo_url: publicUrl })
            toast.success("Logo uploaded! Don't forget to save workspace.")
        }
        setLoading(false)
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // 1. Update Auth User Metadata (so it persists in session)
        const { data: authData, error: authError } = await supabase.auth.updateUser({
            data: {
                full_name: user.user_metadata?.full_name,
                avatar_url: user.user_metadata?.avatar_url
            }
        })

        if (authError) {
            toast.error("Failed to update profile: " + authError.message)
            setLoading(false)
            return
        }

        // 2. Upsert into public 'users' table (for other users to see)
        const { error: dbError } = await supabase
            .from("users")
            .upsert({
                email: user.email,
                full_name: user.user_metadata?.full_name,
                avatar_url: user.user_metadata?.avatar_url,
                updated_at: new Date().toISOString()
            } as any, { onConflict: 'email' })

        if (dbError) {
            console.error("DB Update Error Object:", dbError)
            console.error("DB Update Error Message:", dbError.message)
            console.error("DB Update Error Details:", dbError.details)
            console.error("DB Update Error Hint:", dbError.hint)
            // Don't block UI success if just the public record failed, but good to know
        }

        setUser(authData.user)
        toast.success("Profile updated successfully")
        setLoading(false)
    }

    const handleUpdateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase
            .from("workspaces")
            .update({
                name: workspace.name,
                logo_url: workspace.logo_url,
                branding_config: workspace.branding_config
            } as any)
            .eq("id", workspace.id)

        if (error) {
            console.error("Workspace Update Error:", error)
            toast.error("Failed to update workspace")
        } else {
            toast.success("Workspace settings saved")
            // Update local state is already done via onChange, so no need to reload
        }
        setLoading(false)
    }

    if (!user) return null

    return (
        <div className="container max-w-4xl py-10 animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 glass-card border-0">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="workspace">Workspace</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Manage your public profile and account settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="w-20 h-20 border-2 border-zinc-800">
                                    <AvatarImage src={user.user_metadata?.avatar_url} />
                                    <AvatarFallback className="text-xl bg-zinc-900 text-zinc-400">
                                        {user.email?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                                        <div className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md border border-zinc-800 transition-colors text-sm font-medium">
                                            Change Avatar
                                        </div>
                                    </Label>
                                    <Input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(e, "avatars")}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={user.email} disabled className="bg-zinc-900 border-zinc-800 text-zinc-400" />
                            </div>
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={user.user_metadata?.full_name || ""}
                                    onChange={(e) => setUser({ ...user, user_metadata: { ...user.user_metadata, full_name: e.target.value } })}
                                    placeholder="Enter your name"
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleUpdateProfile} disabled={loading} className="bg-[var(--brand)] text-black hover:opacity-90 transition-opacity">
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Workspace Tab */}
                <TabsContent value="workspace">
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Workspace</CardTitle>
                            <CardDescription>Configure your agency workspace and branding.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {workspace && (
                                <>
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-xl border-2 border-zinc-800 bg-zinc-900 flex items-center justify-center overflow-hidden">
                                            {workspace.logo_url ? (
                                                <img src={workspace.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-zinc-600">{workspace.name?.[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="logo-upload" className="cursor-pointer">
                                                <div className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md border border-zinc-800 transition-colors text-sm font-medium">
                                                    Upload Logo
                                                </div>
                                            </Label>
                                            <Input
                                                id="logo-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e, "logos")}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Workspace Name</Label>
                                        <Input
                                            value={workspace.name}
                                            onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                                            className="bg-zinc-900 border-zinc-800"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Primary Color</Label>
                                            <div className="flex gap-2">
                                                <div
                                                    className="w-10 h-10 rounded border border-zinc-700"
                                                    style={{ backgroundColor: workspace.branding_config?.primaryColor || 'var(--brand)' }}
                                                />
                                                <Input
                                                    value={workspace.branding_config?.primaryColor}
                                                    onChange={(e) => {
                                                        const color = e.target.value
                                                        setWorkspace({
                                                            ...workspace,
                                                            branding_config: { ...workspace.branding_config, primaryColor: color }
                                                        })
                                                        if (/^#[0-9A-F]{6}$/i.test(color)) {
                                                            document.documentElement.style.setProperty("--brand", color)
                                                        }
                                                    }}
                                                    placeholder="#ccff00"
                                                    className="bg-zinc-900 border-zinc-800 font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-t border-zinc-900 pt-6">
                                        <Label className="text-base">Background</Label>

                                        <Tabs defaultValue={workspace.branding_config?.background?.type || "solid"} onValueChange={(val) => {
                                            setWorkspace({
                                                ...workspace,
                                                branding_config: {
                                                    ...workspace.branding_config,
                                                    background: { ...workspace.branding_config?.background, type: val }
                                                }
                                            })
                                        }}>
                                            <TabsList className="bg-zinc-900 border border-zinc-800">
                                                <TabsTrigger value="solid">Solid Color</TabsTrigger>
                                                <TabsTrigger value="gradient">Gradient</TabsTrigger>
                                                <TabsTrigger value="image">Image</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="solid" className="mt-4 space-y-4">
                                                <div className="flex gap-2 items-center">
                                                    <div
                                                        className="w-10 h-10 rounded border border-zinc-700"
                                                        style={{ backgroundColor: workspace.branding_config?.background?.value || '#09090b' }}
                                                    />
                                                    <Input
                                                        value={workspace.branding_config?.background?.type === 'solid' ? workspace.branding_config?.background?.value : ''}
                                                        onChange={(e) => setWorkspace({
                                                            ...workspace,
                                                            branding_config: {
                                                                ...workspace.branding_config,
                                                                background: { type: 'solid', value: e.target.value }
                                                            }
                                                        })}
                                                        placeholder="#09090b"
                                                        className="bg-zinc-900 border-zinc-800 font-mono"
                                                    />
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="gradient" className="mt-4 space-y-4">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        "linear-gradient(to right, #434343 0%, black 100%)",
                                                        "linear-gradient(to top, #09203f 0%, #537895 100%)",
                                                        "linear-gradient(15deg, #13547a 0%, #80d0c7 100%)",
                                                        "linear-gradient(to top, #1e3c72 0%, #1e3c72 1%, #2a5298 100%)"
                                                    ].map((grad, i) => (
                                                        <div
                                                            key={i}
                                                            className="h-20 rounded-lg cursor-pointer border-2 border-transparent hover:border-[var(--brand)] transition-all"
                                                            style={{ backgroundImage: grad }}
                                                            onClick={() => setWorkspace({
                                                                ...workspace,
                                                                branding_config: {
                                                                    ...workspace.branding_config,
                                                                    background: { type: 'gradient', value: grad }
                                                                }
                                                            })}
                                                        />
                                                    ))}
                                                </div>
                                                <Input
                                                    value={workspace.branding_config?.background?.type === 'gradient' ? workspace.branding_config?.background?.value : ''}
                                                    onChange={(e) => setWorkspace({
                                                        ...workspace,
                                                        branding_config: {
                                                            ...workspace.branding_config,
                                                            background: { type: 'gradient', value: e.target.value }
                                                        }
                                                    })}
                                                    placeholder="linear-gradient(...)"
                                                    className="bg-zinc-900 border-zinc-800 font-mono text-xs"
                                                />
                                            </TabsContent>

                                            <TabsContent value="image" className="mt-4 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    {workspace.branding_config?.background?.type === 'image' && workspace.branding_config?.background?.value && (
                                                        <div className="w-32 h-20 rounded-lg border border-zinc-800 overflow-hidden relative">
                                                            <img
                                                                src={workspace.branding_config.background.value}
                                                                alt="Background"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Label htmlFor="bg-upload" className="cursor-pointer">
                                                            <div className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md border border-zinc-800 transition-colors text-sm font-medium">
                                                                Upload Background Image
                                                            </div>
                                                        </Label>
                                                        <Input
                                                            id="bg-upload"
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                if (!e.target.files || e.target.files.length === 0) return
                                                                const file = e.target.files[0]
                                                                const fileExt = file.name.split(".").pop()
                                                                const fileName = `bg-${Math.random()}.${fileExt}`

                                                                setLoading(true)
                                                                const { error: uploadError } = await supabase.storage.from("logos").upload(fileName, file) // Reusing logos bucket for now

                                                                if (uploadError) {
                                                                    toast.error("Error uploading background")
                                                                    setLoading(false)
                                                                    return
                                                                }

                                                                const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(fileName)

                                                                setWorkspace({
                                                                    ...workspace,
                                                                    branding_config: {
                                                                        ...workspace.branding_config,
                                                                        background: { type: 'image', value: publicUrl }
                                                                    }
                                                                })
                                                                toast.success("Background uploaded!")
                                                                setLoading(false)
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-zinc-500">
                                                    Recommended: 1920x1080px or larger. Darker images work best.
                                                </p>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleUpdateWorkspace} disabled={loading} className="bg-[var(--brand)] text-black hover:opacity-90 transition-opacity">
                                {loading ? "Saving..." : "Save Workspace"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Appearance Tab */}
                <TabsContent value="appearance">
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the application.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => setTheme("light")}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-all"
                                >
                                    <Sun className="w-8 h-8 text-zinc-400" />
                                    <span className="text-sm font-medium text-zinc-300">Light</span>
                                </button>
                                <button
                                    onClick={() => setTheme("dark")}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#ccff00] bg-zinc-900"
                                >
                                    <Moon className="w-8 h-8 text-[#ccff00]" />
                                    <span className="text-sm font-bold text-white">Dark</span>
                                </button>
                                <button
                                    onClick={() => setTheme("system")}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-all"
                                >
                                    <Laptop className="w-8 h-8 text-zinc-400" />
                                    <span className="text-sm font-medium text-zinc-300">System</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

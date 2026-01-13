"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            toast.success("Welcome back, Ninja! 🥷")
            router.push("/dashboard")
        } catch (error: any) {
            toast.error(error.message || "Login failed")
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#ccff00] to-green-400 flex items-center justify-center text-black font-black text-2xl">
                        N
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-zinc-400">Login to Ninja Gen Z OS</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ninja@agency.com"
                            className="mt-2"
                            data-testid="login-email"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="mt-2"
                            data-testid="login-password"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#ccff00] text-black hover:bg-[#b3ff00]"
                        data-testid="login-submit"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </form>

                <p className="text-center text-zinc-500 text-sm mt-6">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-[#ccff00] hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}

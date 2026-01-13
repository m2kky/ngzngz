"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"

export default function SignupPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient() as any

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            })

            if (authError) throw authError

            // Create user profile
            if (authData.user) {
                const { error: profileError } = await supabase.from("users").insert([
                    {
                        email,
                        full_name: fullName,
                        password_hash: "hashed", // In production, handle properly
                        role: "SQUAD_MEMBER",
                    },
                ])

                if (profileError) throw profileError
            }

            toast.success("Account created! Welcome, Ninja! 🥷")
            router.push("/dashboard")
        } catch (error: any) {
            toast.error(error.message || "Signup failed")
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
                    <h1 className="text-3xl font-bold text-white mb-2">Join the Squad</h1>
                    <p className="text-zinc-400">Create your Ninja account</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Karim Ahmed"
                            className="mt-2"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ninja@agency.com"
                            className="mt-2"
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
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#ccff00] text-black hover:bg-[#b3ff00]"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                </form>

                <p className="text-center text-zinc-500 text-sm mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#ccff00] hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    )
}

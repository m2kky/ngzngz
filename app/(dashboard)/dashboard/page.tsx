"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { LeaderView } from "@/components/dashboard/leader-view"
import { EmployeeView } from "@/components/dashboard/employee-view"

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchUser() {
            const { data: { user: authUser } } = await supabase.auth.getUser()

            if (authUser) {
                const { data: userData } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", authUser.email)
                    .single()

                if (userData) setUser(userData)
            }
            setIsLoading(false)
        }
        fetchUser()
    }, [])

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--brand)]" />
            </div>
        )
    }

    if (!user) return null

    const isLeader = ['SYSTEM_ADMIN', 'ACCOUNT_MANAGER', 'MEDIA_BUYER'].includes(user.role)

    return (
        <div className="pb-10">
            {isLeader ? (
                <LeaderView user={user} />
            ) : (
                <EmployeeView user={user} />
            )}
        </div>
    )
}

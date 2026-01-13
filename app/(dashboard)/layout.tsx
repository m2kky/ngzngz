"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"
import { Header } from "@/components/layout/header"
import { SenseiWidget } from "@/components/sensei/sensei-widget"
import { ProductTour } from "@/components/tour/product-tour"
import { WarRoomPanel } from "@/components/chat/war-room-panel"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import type { Database } from "@/types/database"

type Workspace = Database["public"]["Tables"]["workspaces"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <WorkspaceProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </WorkspaceProvider>
    )
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const supabase = createClient() as any
    const { currentWorkspace } = useWorkspace()

    const [showOnboarding, setShowOnboarding] = useState(false)

    useEffect(() => {
        async function fetchUser() {
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser()

            if (authUser) {
                const { data: userData } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", authUser.email)
                    .single()

                if (userData) {
                    setUser(userData)
                }
            }
        }

        fetchUser()
    }, [supabase])

    // Check for Onboarding Eligibility
    useEffect(() => {
        async function checkOnboarding() {
            if (!currentWorkspace || !user) return
            // Only admins trigger onboarding
            if (user.role !== 'SYSTEM_ADMIN' && user.role !== 'ACCOUNT_MANAGER') return

            const { count, error } = await supabase
                .from('clients')
                .select('*', { count: 'exact', head: true })
                .eq('workspace_id', currentWorkspace.id)

            if (!error && count === 0) {
                setShowOnboarding(true)
            }
        }
        checkOnboarding()
    }, [currentWorkspace, user, supabase])

    // Apply branding
    useEffect(() => {
        if (currentWorkspace?.branding_config) {
            const config = currentWorkspace.branding_config as any
            if (config.primaryColor) {
                document.documentElement.style.setProperty("--brand", config.primaryColor)
            }
        }
    }, [currentWorkspace])

    const getBackgroundStyle = () => {
        const config = currentWorkspace?.branding_config as any
        const bg = config?.background

        if (!bg) return { backgroundColor: "#09090b" } // Default zinc-950

        // Safety check: malformed data in DB (e.g. SCSS code pasted as value)
        if (typeof bg.value === 'string' && (bg.value.includes(';') || bg.value.includes('$') || bg.value.includes(':'))) {
            // Exception for image urls which might have colons
            if (bg.type !== 'image') {
                return { backgroundColor: "#09090b" }
            }
        }

        switch (bg.type) {
            case "solid":
                return { backgroundColor: bg.value }
            case "gradient":
                return { backgroundImage: bg.value }
            case "image":
                return {
                    backgroundImage: `url(${bg.value})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }
            default:
                return { backgroundColor: "#09090b" }
        }
    }

    return (
        <div
            className="flex min-h-screen font-sans text-zinc-200 transition-all duration-500 ease-in-out"
            style={getBackgroundStyle()}
        >
            {/* Onboarding Wizard Overlay */}
            {showOnboarding && <OnboardingWizard user={user} currentWorkspace={currentWorkspace} />}

            {/* Overlay for readability if image background */}
            {(currentWorkspace?.branding_config as any)?.background?.type === 'image' && (
                <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none fixed" />
            )}

            <div className="relative z-10 flex w-full min-h-screen">
                {/* Workspace Switcher */}
                <WorkspaceSwitcher />

                {/* Sidebar */}
                <SidebarWrapper user={user} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Header user={user} />
                    <MainContent pathname={usePathname()}>
                        {children}
                    </MainContent>
                </div>

                {/* Interactive Product Tour */}
                <ProductTour user={user} workspace={currentWorkspace} />
            </div>

            {/* Sensei AI Widget */}
            <SenseiWidget
                toastMessage={toastMessage}
                onClearToast={() => setToastMessage(null)}
            />

            {/* War Room Chat Panel */}
            <WarRoomPanel />
        </div>
    )
}

// Wrapper to access context
import { useWorkspace } from "@/components/providers/workspace-provider"
import { WorkspaceProvider } from "@/components/providers/workspace-provider"

// ... existing imports ...

function MainContent({ children, pathname }: { children: React.ReactNode, pathname: string }) {
    // Pages that need to control their own scroll/layout (Full Screen Apps)
    const isFixedPage =
        pathname.startsWith("/tasks") ||
        pathname.startsWith("/projects") ||
        pathname.startsWith("/automation") ||
        pathname.startsWith("/inbox");

    return (
        <main
            className={cn(
                "flex-1 flex flex-col min-h-0", // min-h-0 is crucial for nested flex scrolling
                isFixedPage ? "overflow-hidden" : "overflow-y-auto p-8"
            )}
        >
            {children}
        </main>
    )
}

function SidebarWrapper({ user }: { user: User | null }) {
    const { currentWorkspace } = useWorkspace()
    return (
        <Sidebar
            workspaceName={currentWorkspace?.name || "Select Workspace"}
            workspaceLogo={currentWorkspace?.logo_url}
            workspaceId={currentWorkspace?.id}
            userRole={user?.role || "SQUAD_MEMBER"}
        />
    )
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Define public routes
    const isPublicRoute =
        path === '/' ||
        path.startsWith('/auth') ||
        path.startsWith('/api') ||
        path.startsWith('/_next') ||
        path.includes('.')

    if (!user) {
        // If not logged in and trying to access protected route, redirect to Landing Page
        if (!isPublicRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    } else {
        // User is logged in

        // Check if user has a workspace
        const { data: memberships } = await supabase
            .from('workspace_members')
            .select('workspace_id')
            .eq('user_id', user.id)
            .limit(1)

        const hasWorkspace = memberships && memberships.length > 0

        if (hasWorkspace) {
            // If user has workspace and is on Landing Page or Auth, redirect to Dashboard
            if (path === '/' || path.startsWith('/auth')) {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }

            // RBAC: Restrict sensitive routes
            const restrictedPaths = ['/ads', '/settings', '/reports']
            const isRestrictedPath = restrictedPaths.some(p => path.startsWith(p))

            if (isRestrictedPath) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('role')
                    .eq('email', user.email) // user.id is safer but email works if id not available in auth object sometimes
                    .single()

                const role = userData?.role
                const isLeader = ['SYSTEM_ADMIN', 'ACCOUNT_MANAGER', 'MEDIA_BUYER'].includes(role)

                if (!isLeader) {
                    const url = request.nextUrl.clone()
                    url.pathname = '/dashboard' // Redirect unauthorized users to dashboard
                    return NextResponse.redirect(url)
                }
            }
        } else {
            // User has NO workspace
            // Redirect to Onboarding if trying to access Dashboard or other protected routes
            // Allow access to /onboarding, /auth, /api
            if (!path.startsWith('/onboarding') && !path.startsWith('/auth') && !path.startsWith('/api') && !path.startsWith('/_next') && !path.includes('.')) {
                const url = request.nextUrl.clone()
                url.pathname = '/onboarding'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}

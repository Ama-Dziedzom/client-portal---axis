import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: req,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll().map(({ name, value }) => ({ name, value }))
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        req.cookies.set({ name, value })
                        res.cookies.set({ name, value, ...options })
                    })
                },
            },
        }
    )

    const { data: { session } } = await supabase.auth.getSession()
    const pathname = req.nextUrl.pathname

    // Define route zones with precise matching logic
    const clientProtectedPaths = ['/dashboard', '/projects', '/documents', '/invoices', '/messages', '/settings']
    const isClientRoute = clientProtectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'))
    const isStudioRoute = pathname === '/studio' || pathname.startsWith('/studio/')

    // ── Not logged in ──
    if (!session) {
        if (isClientRoute) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
        if (isStudioRoute && pathname !== '/studio-login') {
            return NextResponse.redirect(new URL('/studio-login', req.url))
        }
        return res
    }

    // ── Logged in: Role-based Protection ──

    // 1. Protect Studio Routes (only allow if in studio_users)
    if (isStudioRoute && pathname !== '/studio-login') {
        const { data: studioUser } = await supabase
            .from('studio_users')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle()

        if (!studioUser) {
            // Not a studio user. Check if they are a client.
            const { data: clientUser } = await supabase
                .from('clients')
                .select('id')
                .eq('id', session.user.id)
                .maybeSingle()

            if (clientUser) {
                // They are a client, send them to their dashboard
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }
            
            // Neither? Send to studio-login
            return NextResponse.redirect(new URL('/studio-login', req.url))
        }
    }

    // 2. Protect Client Routes (only allow if in clients table)
    if (isClientRoute) {
        const { data: clientUser } = await supabase
            .from('clients')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle()

        if (!clientUser) {
            // Not a client. Check if they are a studio user.
            const { data: studioUser } = await supabase
                .from('studio_users')
                .select('id')
                .eq('id', session.user.id)
                .maybeSingle()

            if (studioUser) {
                // They are a studio user, send them to the studio panel
                return NextResponse.redirect(new URL('/studio', req.url))
            }
            
            // Neither? Allow to avoid infinite loops.
            return res
        }
    }

    // 3. Redirect logged-in users away from login pages
    if (pathname === '/login') {
        // First check: Are they in studio?
        const { data: studioUser } = await supabase.from('studio_users').select('id').eq('id', session.user.id).maybeSingle()
        if (studioUser) return NextResponse.redirect(new URL('/studio', req.url))
        
        // Second check: Are they a client?
        const { data: clientUser } = await supabase.from('clients').select('id').eq('id', session.user.id).maybeSingle()
        if (clientUser) return NextResponse.redirect(new URL('/dashboard', req.url))
        
        // In neither? Let them stay at /login or handle signout
        return res
    }
    
    if (pathname === '/studio-login') {
        const { data: studioUser } = await supabase.from('studio_users').select('id').eq('id', session.user.id).maybeSingle()
        if (studioUser) return NextResponse.redirect(new URL('/studio', req.url))
        
        // If they are a client but at /studio-login, let them be. 
        // They might be trying to log in as a different user (admin).
        return res
    }

    return res
}

export const config = {
    matcher: [
        '/dashboard',
        '/dashboard/:path*',
        '/projects',
        '/projects/:path*',
        '/documents',
        '/documents/:path*',
        '/invoices',
        '/invoices/:path*',
        '/messages',
        '/messages/:path*',
        '/settings',
        '/settings/:path*',
        '/studio',
        '/studio/:path*',
        '/studio-login',
        '/login',
    ]
}

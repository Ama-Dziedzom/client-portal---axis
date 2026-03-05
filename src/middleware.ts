import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()

    // Skip auth check if Supabase is not configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url') {
        return res
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll().map(({ name, value }) => ({ name, value }))
                },
                setAll(cookies) {
                    cookies.forEach(({ name, value, options }) => {
                        req.cookies.set({ name, value })
                        res.cookies.set({ name, value, ...options })
                    })
                },
            },
        }
    )

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // If no session and trying to access protected routes, redirect to login
    if (!session && !req.nextUrl.pathname.startsWith('/login')) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/login'
        redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // If logged in and trying to access login page, redirect to dashboard
    if (session && req.nextUrl.pathname.startsWith('/login')) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/dashboard'
        return NextResponse.redirect(redirectUrl)
    }

    return res
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/projects/:path*',
        '/invoices/:path*',
        '/messages/:path*',
        '/documents/:path*',
        '/settings/:path*',
        '/login',
    ],
}

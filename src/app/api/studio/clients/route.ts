import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: '', ...options })
                    },
                },
                cookieOptions: {
                    name: 'sb-axis-studio-token',
                },
            }
        )
        
        // 1. Verify session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminClient = getSupabaseAdmin()

        // 2. Verify requester is a studio user
        const { data: studioUser, error: studioError } = await adminClient
            .from('studio_users')
            .select('role')
            .eq('id', session.user.id)
            .single()
        if (studioError || !studioUser) {
            return NextResponse.json({ error: 'Forbidden: Studio access required' }, { status: 403 })
        }

        const { name, email, phone, password } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 3. Create Auth User
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name }
        })

        if (authError) {
            console.error('Auth creation error:', authError)
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        const userId = authData.user.id

        // 4. Create Client Record
        const { error: clientError } = await adminClient
            .from('clients')
            .insert({
                id: userId,
                name,
                email,
                phone,
                active: true
            })

        if (clientError) {
            console.error('Client record error:', clientError)
            // Rollback auth user? Optional but recommended
            await adminClient.auth.admin.deleteUser(userId)
            return NextResponse.json({ error: 'Failed to create client record' }, { status: 500 })
        }

        return NextResponse.json({ 
            success: true, 
            userId,
            message: 'Client created successfully' 
        })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

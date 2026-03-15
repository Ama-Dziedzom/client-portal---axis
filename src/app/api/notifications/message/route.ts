import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail, newMessageEmail } from '@/lib/email'
import { serverEnv } from '@/lib/env'
import { logger } from '@/lib/logger'

// API route for sending message notification emails (called by admin/studio)
export async function POST(req: NextRequest) {
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
            .select('id')
            .eq('id', session.user.id)
            .single()

        if (studioError || !studioUser) {
            logger.warn('API', 'Unauthorized notification attempt', { userId: session.user.id })
            return NextResponse.json({ error: 'Forbidden: Studio access required' }, { status: 403 })
        }

        const { clientId, senderName, projectTitle } = await req.json()

        if (!clientId || !senderName || !projectTitle) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get client email
        const { data: client, error } = await adminClient
            .from('clients')
            .select('email, name')
            .eq('id', clientId)
            .single()

        if (error || !client) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            )
        }

        const portalUrl = serverEnv.portalUrl()

        await sendEmail({
            to: client.email,
            subject: `New message from ${senderName} — ${projectTitle}`,
            html: newMessageEmail(client.name, senderName, projectTitle, portalUrl),
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        logger.error('API', 'Notification email error', error)
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        )
    }
}


import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail, newMessageEmail } from '@/lib/email'

// API route for sending message notification emails (called by admin/studio)
export async function POST(req: NextRequest) {
    try {
        const { clientId, senderName, projectTitle } = await req.json()

        if (!clientId || !senderName || !projectTitle) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get client email
        const { data: client, error } = await supabaseAdmin
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

        const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'https://clients.studiodomain.com'

        await sendEmail({
            to: client.email,
            subject: `New message from ${senderName} — ${projectTitle}`,
            html: newMessageEmail(client.name, senderName, projectTitle, portalUrl),
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Notification email error:', error)
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        )
    }
}

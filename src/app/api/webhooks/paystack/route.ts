import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendEmail, invoicePaidEmail } from '@/lib/email'
import { formatCurrency } from '@/lib/utils'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
    try {
        // Verify Paystack webhook signature
        const body = await req.text()
        const hash = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
            .update(body)
            .digest('hex')

        const signature = req.headers.get('x-paystack-signature')
        if (hash !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const event = JSON.parse(body)

        if (event.event === 'charge.success') {
            const { reference, metadata } = event.data

            if (metadata?.invoice_id) {
                // Update invoice status
                const { data: invoice, error: updateError } = await supabaseAdmin
                    .from('invoices')
                    .update({
                        status: 'paid',
                        paid_at: new Date().toISOString(),
                        paystack_reference: reference,
                    })
                    .eq('id', metadata.invoice_id)
                    .select('*, clients(*)')
                    .single()

                if (updateError) {
                    console.error('Error updating invoice:', updateError)
                    return NextResponse.json({ error: 'Invoice update failed' }, { status: 500 })
                }

                // Send email notification
                if (invoice) {
                    try {
                        const clientData = (invoice as any).clients
                        if (clientData?.email) {
                            await sendEmail({
                                to: clientData.email,
                                subject: `Payment Confirmed — Invoice ${invoice.invoice_number}`,
                                html: invoicePaidEmail(
                                    clientData.name,
                                    invoice.invoice_number,
                                    formatCurrency(invoice.total, invoice.currency)
                                ),
                            })
                        }
                    } catch (emailError) {
                        console.error('Email notification failed:', emailError)
                        // Don't fail the webhook for email errors
                    }
                }
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

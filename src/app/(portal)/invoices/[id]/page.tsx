'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Invoice, LineItem } from '@/types/database'
import { formatCurrency, formatDate, formatStatus, getStatusBadgeClass } from '@/lib/utils'
import { publicEnv } from '@/lib/env'
import {
    ArrowLeft,
    CreditCard,
    CheckCircle2,
    Loader2,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function InvoiceDetailPage() {
    const { id } = useParams()
    const { client, loading: authLoading } = useAuth()
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(false)

    useEffect(() => {
        if (client && id) {
            fetchInvoice()
        } else if (!authLoading) {
            setLoading(false)
        }
    }, [client, id, authLoading])

    const fetchInvoice = async () => {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('id', id as string)
                .single()

            if (error) throw error
            setInvoice(data)
        } catch (error) {
            console.error('Error fetching invoice:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePayment = async () => {
        if (!invoice || !client) return

        setPaying(true)
        try {
            // Dynamically import Paystack
            const PaystackPop = (await import('@paystack/inline-js')).default
            const paystack = new PaystackPop()

            paystack.newTransaction({
                key: publicEnv.paystackPublicKey,
                email: client.email,
                amount: Math.round(invoice.total * 100), // Paystack uses kobo/pesewas
                currency: invoice.currency === 'ZMW' ? 'ZAR' : invoice.currency, // Paystack supported currencies
                reference: `INV-${invoice.id}-${Date.now()}`,
                metadata: {
                    invoice_id: invoice.id,
                    invoice_number: invoice.invoice_number,
                    client_id: client.id,
                },
                onSuccess: (transaction: any) => {
                    toast.success('Payment submitted successfully!')
                    
                    // The actual update happens via webhook for security.
                    // We poll the database to see when it's updated.
                    setLoading(true)
                    let checkCount = 0
                    const interval = setInterval(async () => {
                        const { data } = await supabase
                            .from('invoices')
                            .select('status')
                            .eq('id', invoice.id)
                            .single()
                        
                        if (data?.status === 'paid' || checkCount > 15) {
                            clearInterval(interval)
                            fetchInvoice() // Refresh page data
                        }
                        checkCount++
                    }, 3000)
                },
                onCancel: () => {
                    toast.error('Payment cancelled')
                    setPaying(false)
                },
            })
        } catch (error: any) {
            toast.error('Failed to initialize payment')
            console.error(error)
        } finally {
            setPaying(false)
        }
    }

    if (loading) {
        return (
            <div className="page-container">
                <div className="skeleton h-8 w-32 mb-6" />
                <div className="skeleton h-96 rounded-2xl" />
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="page-container">
                <div className="card-flat text-center py-16">
                    <h2 className="font-heading text-xl font-semibold text-text-primary mb-2">Invoice not found</h2>
                    <Link href="/invoices" className="btn-primary mt-4 inline-flex">
                        <ArrowLeft className="w-4 h-4" /> Back to Invoices
                    </Link>
                </div>
            </div>
        )
    }

    const lineItems: LineItem[] = Array.isArray(invoice.line_items)
        ? invoice.line_items
        : JSON.parse(String(invoice.line_items || '[]'))

    return (
        <div className="page-container">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {/* Back */}
                <Link href="/invoices" className="btn-ghost inline-flex mb-6 -ml-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Invoices
                </Link>

                {/* Invoice */}
                <div className="card-flat max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 pb-8 border-b border-border">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-heading font-semibold text-text-primary">
                                    {invoice.title}
                                </h1>
                                <span className={getStatusBadgeClass(invoice.status)}>
                                    {formatStatus(invoice.status)}
                                </span>
                            </div>
                            <p className="text-sm text-text-secondary">Invoice {invoice.invoice_number}</p>
                        </div>

                        <div className="text-right">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-2 ml-auto">
                                <span className="text-white font-heading text-lg">A</span>
                            </div>
                            <p className="text-xs text-text-secondary">Axis Living</p>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div>
                            <p className="text-xs text-text-secondary mb-1">Date Issued</p>
                            <p className="text-sm font-medium text-text-primary">
                                {formatDate(invoice.created_at)}
                            </p>
                        </div>
                        {invoice.due_date && (
                            <div>
                                <p className="text-xs text-text-secondary mb-1">Due Date</p>
                                <p className={`text-sm font-medium ${invoice.status === 'overdue' ? 'text-error' : 'text-text-primary'
                                    }`}>
                                    {formatDate(invoice.due_date)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Line Items */}
                    <div className="mb-8">
                        <div className="bg-background rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider p-4">
                                            Description
                                        </th>
                                        <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider p-4 w-20">
                                            Qty
                                        </th>
                                        <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider p-4 w-32">
                                            Unit Price
                                        </th>
                                        <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider p-4 w-32">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineItems.map((li, idx) => (
                                        <tr key={idx} className="border-b border-border/50 last:border-0">
                                            <td className="p-4 text-sm text-text-primary">{li.description}</td>
                                            <td className="p-4 text-sm text-text-primary text-right">{li.quantity}</td>
                                            <td className="p-4 text-sm text-text-primary text-right">
                                                {formatCurrency(li.unit_price, invoice.currency)}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-text-primary text-right">
                                                {formatCurrency(li.amount, invoice.currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Subtotal</span>
                            <span className="text-text-primary">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                        </div>
                        {invoice.tax_rate > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Tax ({invoice.tax_rate}%)</span>
                                <span className="text-text-primary">{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-heading font-semibold pt-3 border-t border-border">
                            <span className="text-text-primary">Total</span>
                            <span className="text-text-primary">{formatCurrency(invoice.total, invoice.currency)}</span>
                        </div>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="bg-accent/5 border border-accent/15 rounded-xl p-4 mb-8">
                            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Notes</p>
                            <p className="text-sm text-text-primary/80">{invoice.notes}</p>
                        </div>
                    )}

                    {/* Payment CTA */}
                    {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                        <button
                            onClick={handlePayment}
                            disabled={paying}
                            className="btn-primary w-full justify-center py-4 text-base"
                        >
                            {paying ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Pay {formatCurrency(invoice.total, invoice.currency)}
                                </>
                            )}
                        </button>
                    )}

                    {/* Paid confirmation */}
                    {invoice.status === 'paid' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-800">Payment Received</p>
                                <p className="text-xs text-emerald-600 mt-0.5">
                                    Paid on {invoice.paid_at ? formatDate(invoice.paid_at) : '—'}
                                    {invoice.paystack_reference && ` · Ref: ${invoice.paystack_reference}`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

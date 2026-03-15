'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { studioSupabase as supabase } from '@/lib/supabase'
import { Invoice, Project, Client } from '@/types/database'
import { 
    ArrowLeft, 
    Download, 
    Send, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Trash2, 
    Edit2,
    Receipt,
    Printer,
    Mail,
    Loader2,
    ShieldCheck,
    CreditCard
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate, formatStatus, getStatusBadgeClass } from '@/lib/utils'

export default function StudioInvoiceDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [invoice, setInvoice] = useState<(Invoice & { project: Project; client: Client }) | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        if (id) fetchInvoice()
    }, [id])

    const fetchInvoice = async () => {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select('*, projects(*), clients(*)')
                .eq('id', id as string)
                .single()

            if (error) throw error
            setInvoice({
                ...data,
                project: data.projects,
                client: data.clients
            })
        } catch (error) {
            console.error('Error fetching invoice:', error)
            toast.error('Failed to load invoice details')
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (newStatus: string) => {
        setUpdating(true)
        try {
            const { error } = await supabase
                .from('invoices')
                .update({ status: newStatus })
                .eq('id', id as string)

            if (error) throw error
            toast.success(`Invoice marked as ${newStatus}`)
            setInvoice(prev => prev ? { ...prev, status: newStatus as any } : null)
        } catch (error) {
            console.error('Update error:', error)
            toast.error('Failed to update invoice status')
        } finally {
            setUpdating(false)
        }
    }

    const deleteInvoice = async () => {
        if (!window.confirm('Delete this invoice? This cannot be undone.')) return
        try {
            const { error } = await supabase.from('invoices').delete().eq('id', id as string)
            if (error) throw error
            toast.success('Invoice deleted')
            router.push('/studio/invoices')
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Failed to delete invoice')
        }
    }

    if (loading) return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin opacity-40" />
            </div>
        )

    if (!invoice) return (
        <div className="text-center py-20">
            <p className="text-text-secondary">Invoice not found</p>
            <Link href="/studio/invoices" className="btn-ghost mt-4">Back to Invoices</Link>
        </div>
    )

    const lineItems = (invoice.line_items as any[]) || []

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Link 
                        href="/studio/invoices" 
                        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Invoices
                    </Link>
                    <div className="flex items-center gap-4 mb-2">
                        <span className={getStatusBadgeClass(invoice.status)}>
                            {formatStatus(invoice.status)}
                        </span>
                        <span className="text-sm font-mono font-bold text-text-secondary">#{invoice.invoice_number}</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary tracking-tight">
                        Invoice detail
                    </h1>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {invoice.status === 'draft' && (
                        <button onClick={() => updateStatus('sent')} disabled={updating} className="btn-primary">
                            <Send className="w-4 h-4" /> Send to Client
                        </button>
                    )}
                    {invoice.status === 'sent' && (
                        <button onClick={() => updateStatus('paid')} disabled={updating} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle2 className="w-4 h-4" /> Mark as Paid
                        </button>
                    )}
                    <button className="btn-secondary" onClick={() => window.print()}>
                        <Printer className="w-4 h-4" /> Print PDF
                    </button>
                    <button onClick={deleteInvoice} className="btn-ghost text-error p-2 hover:bg-red-50 rounded-xl">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Invoice Document Look */}
            <div className="card-flat bg-white shadow-2xl shadow-black/5 p-8 md:p-12 border-border overflow-hidden relative">
                {/* Branding watermark or corner label */}
                <div className="absolute top-0 right-0 px-6 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-bl-xl">
                    Internal Billing Record
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-10 mb-16">
                    <div>
                        <h2 className="text-2xl font-heading font-bold text-text-primary mb-6">AXIS LIVING</h2>
                        <div className="space-y-1 text-sm text-text-secondary font-body">
                            <p>Studio 102, Innovation Hub</p>
                            <p>Lusaka, Zambia</p>
                            <p>billing@axisliving.com</p>
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Invoice Issued To</h3>
                        <div className="space-y-1 text-sm text-text-primary font-body">
                            <p className="font-bold text-base">{invoice.client.name}</p>
                            <p>{invoice.client.email}</p>
                            <p>{invoice.client.address || 'No address provided'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 py-8 border-y border-border">
                    <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-1">Invoice Date</p>
                        <p className="text-sm font-semibold text-text-primary">{formatDate(invoice.created_at)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-1">Due Date</p>
                        <p className="text-sm font-semibold text-text-primary">{formatDate(invoice.due_date)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-1">Project</p>
                        <p className="text-sm font-semibold text-text-primary truncate">{invoice.project.title}</p>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-1">Reference</p>
                        <p className="text-sm font-semibold text-text-primary">{invoice.invoice_number}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="mb-16">
                    <div className="flex items-center px-4 py-3 border-b border-border text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                        <div className="flex-1">Description / Service</div>
                        <div className="w-24 text-center">Qty</div>
                        <div className="w-32 text-right">Unit Price</div>
                        <div className="w-32 text-right">Amount</div>
                    </div>
                    <div className="divide-y divide-border/50">
                        {lineItems.map((item, idx) => (
                            <div key={idx} className="flex items-center px-4 py-5 text-sm font-body">
                                <div className="flex-1 text-text-primary font-medium">{item.description}</div>
                                <div className="w-24 text-center text-text-secondary">{item.quantity}</div>
                                <div className="w-32 text-right text-text-secondary">{formatCurrency(item.unit_price)}</div>
                                <div className="w-32 text-right font-bold text-text-primary">{formatCurrency(item.amount)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="flex flex-col md:flex-row justify-between gap-10">
                    <div className="flex-1 max-w-sm">
                        <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Notes & Instructions</h4>
                        <p className="text-xs text-text-secondary font-body leading-relaxed whitespace-pre-wrap italic bg-accent/5 p-4 rounded-xl">
                            {invoice.notes || 'Default payment terms apply (Net 14). Please contact our studio for wire transfer details if not previously provided.'}
                        </p>
                    </div>
                    <div className="w-full md:w-64 space-y-3">
                        <div className="flex justify-between items-center text-sm text-text-secondary font-body">
                            <span>Subtotal</span>
                            <span>{formatCurrency(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-text-secondary font-body border-b border-border pb-3">
                            <span>Tax (16% VAT)</span>
                            <span>{formatCurrency(invoice.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-heading text-lg font-bold text-text-primary">Total Amount</span>
                            <span className="font-heading text-2xl font-bold text-primary">{formatCurrency(invoice.total)}</span>
                        </div>
                    </div>
                </div>
                
                {invoice.status === 'paid' && (
                    <div className="mt-16 flex items-center justify-center gap-3 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-[0.2em]">Full Payment Received</span>
                    </div>
                )}
            </div>

            {/* Quick Actions Sidebar / Bottom */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-flat flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-text-primary">Payment Tracking</h4>
                        <p className="text-xs text-text-secondary">Keep records of all incoming transfers.</p>
                    </div>
                    <button className="btn-ghost text-xs ml-auto">Log Payment</button>
                </div>
                <div className="card-flat flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-text-primary">Send Reminder</h4>
                        <p className="text-xs text-text-secondary">Notify client of due date if pending.</p>
                    </div>
                    <button className="btn-ghost text-xs ml-auto">Email Hub</button>
                </div>
            </div>
        </div>
    )
}

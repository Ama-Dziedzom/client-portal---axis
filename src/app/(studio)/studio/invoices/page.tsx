'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { studioSupabase as supabase } from '@/lib/supabase'
import { Invoice } from '@/types/database'
import { formatCurrency, formatDate, formatStatus, getStatusBadgeClass } from '@/lib/utils'
import Link from 'next/link'
import { 
    Receipt, 
    Search, 
    Plus, 
    Filter,
    ArrowRight,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    DollarSign
} from 'lucide-react'

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function StudioInvoicesPage() {
    const [invoices, setInvoices] = useState<(Invoice & { client_name?: string; project_title?: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchInvoices()
    }, [])

    const fetchInvoices = async () => {
        try {
            const { data: invoicesData, error } = await supabase
                .from('invoices')
                .select('*, projects(title), clients(name)')
                .order('created_at', { ascending: false })

            if (error) throw error

            setInvoices(
                (invoicesData || []).map((i: any) => ({
                    ...i,
                    client_name: i.clients?.name || 'Unknown Client',
                    project_title: i.projects?.title || 'Unknown Project'
                }))
            )
        } catch (error) {
            console.error('Error fetching invoices:', error)
        } finally {
            setLoading(false)
        }
    }

    const filtered = invoices.filter(i => {
        const matchesSearch = i.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             i.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             i.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || i.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total), 0)
    const totalOutstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + Number(i.total), 0)

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="skeleton h-10 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
                </div>
            </div>
        )
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">Invoices</h1>
                    <p className="text-text-secondary font-body text-lg">Billing and revenue summary</p>
                </div>
                <Link href="/studio/invoices/new" className="btn-primary w-full sm:w-auto shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" /> New Invoice
                </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                <div className="card-flat bg-primary/5 border-primary/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Lifetime Revenue</p>
                        <p className="text-2xl font-heading font-bold text-text-primary">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                </div>
                <div className="card-flat bg-amber-50/50 border-amber-100 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Total Outstanding</p>
                        <p className="text-2xl font-heading font-bold text-text-primary">{formatCurrency(totalOutstanding)}</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                </div>
                <div className="card-flat bg-blue-50/50 border-blue-100 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Paid Invoices</p>
                        <p className="text-2xl font-heading font-bold text-text-primary">
                            {invoices.filter(i => i.status === 'paid').length}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={item} className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search invoices, clients or projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-11"
                    />
                </div>
                <div className="min-w-[180px]">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field appearance-none bg-white cursor-pointer"
                    >
                        <option value="all">All Billing Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent / Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </motion.div>

            {/* Invoice List */}
            {filtered.length === 0 ? (
                <motion.div variants={item} className="card-flat flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-accent/15 rounded-2xl flex items-center justify-center mb-4">
                        <Receipt className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">No invoices found</h3>
                    <p className="text-sm text-text-secondary mb-6">Create a billing record for your project work.</p>
                </motion.div>
            ) : (
                <div className="overflow-x-auto">
                    <div className="min-w-[800px] space-y-3 pb-4">
                        <div className="px-6 py-3 flex items-center text-[10px] font-bold text-[#8b8fa3] uppercase tracking-widest">
                            <div className="w-[15%]">Number</div>
                            <div className="w-[25%]">Client & Project</div>
                            <div className="w-[15%]">Issued Date</div>
                            <div className="w-[15%]">Due Date</div>
                            <div className="w-[15%] text-right font-body">Amount</div>
                            <div className="w-[15%] text-right">Status</div>
                        </div>

                        {filtered.map((invoice) => (
                            <Link
                                key={invoice.id}
                                href={`/studio/invoices/${invoice.id}`}
                                className="card-flat flex items-center px-6 py-5 hover:shadow-elevated hover:border-primary/40 transition-all group"
                            >
                                <div className="w-[15%] font-medium text-text-primary group-hover:text-primary transition-colors">
                                    {invoice.invoice_number}
                                </div>
                                <div className="w-[25%] pr-4 min-w-0">
                                    <p className="text-sm font-semibold truncate text-text-primary">{invoice.client_name}</p>
                                    <p className="text-xs text-text-secondary truncate italic uppercase tracking-tighter mt-1">{invoice.project_title}</p>
                                </div>
                                <div className="w-[15%] text-sm text-text-secondary font-body">
                                    {formatDate(invoice.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="w-[15%] text-sm text-text-secondary font-body">
                                    {formatDate(invoice.due_date, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="w-[15%] text-right font-heading font-bold text-text-primary">
                                    {formatCurrency(invoice.total)}
                                </div>
                                <div className="w-[15%] flex justify-end items-center gap-3">
                                    <span className={getStatusBadgeClass(invoice.status)}>
                                        {formatStatus(invoice.status)}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-primary transition-all group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    )
}

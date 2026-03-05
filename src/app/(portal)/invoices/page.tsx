'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Invoice } from '@/types/database'
import { formatCurrency, formatDate, formatStatus, getStatusBadgeClass } from '@/lib/utils'
import Link from 'next/link'
import { Receipt, ArrowRight, Sparkles } from 'lucide-react'

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function InvoicesPage() {
    const { client } = useAuth()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        if (client) fetchInvoices()
    }, [client])

    const fetchInvoices = async () => {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('client_id', client!.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setInvoices(data || [])
        } catch (error) {
            console.error('Error fetching invoices:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredInvoices = filter === 'all'
        ? invoices
        : invoices.filter((i) => i.status === filter)

    const statusFilters = [
        { value: 'all', label: 'All' },
        { value: 'sent', label: 'Awaiting Payment' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
    ]

    const totalOwed = invoices
        .filter((i) => i.status === 'sent' || i.status === 'overdue')
        .reduce((sum, i) => sum + Number(i.total), 0)

    const totalPaid = invoices
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + Number(i.total), 0)

    if (loading) {
        return (
            <div className="page-container">
                <div className="skeleton h-10 w-48 mb-4" />
                <div className="skeleton h-6 w-64 mb-8" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton h-24 rounded-2xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <motion.div variants={container} initial="hidden" animate="show">
                {/* Header */}
                <motion.div variants={item} className="mb-10">
                    <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">
                        Invoices
                    </h1>
                    <p className="text-text-secondary font-body text-lg">
                        Review and pay your project invoices
                    </p>
                </motion.div>

                {/* Summary Cards */}
                {invoices.length > 0 && (
                    <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                        <div className="card-flat">
                            <p className="text-sm text-text-secondary font-body mb-1">Outstanding Balance</p>
                            <p className="text-2xl font-heading font-semibold text-text-primary">
                                {formatCurrency(totalOwed)}
                            </p>
                        </div>
                        <div className="card-flat">
                            <p className="text-sm text-text-secondary font-body mb-1">Total Paid</p>
                            <p className="text-2xl font-heading font-semibold text-success">
                                {formatCurrency(totalPaid)}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Filters */}
                {invoices.length > 0 && (
                    <motion.div variants={item} className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                        {statusFilters.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium font-body whitespace-nowrap transition-all duration-200 ${filter === f.value
                                    ? 'bg-primary text-white shadow-soft'
                                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Invoice List */}
                {filteredInvoices.length === 0 ? (
                    <motion.div variants={item} className="card-flat flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-accent/15 rounded-2xl flex items-center justify-center mb-4">
                            <Sparkles className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
                            {filter === 'all' ? 'No invoices yet' : `No ${formatStatus(filter).toLowerCase()} invoices`}
                        </h3>
                        <p className="text-sm text-text-secondary max-w-sm">
                            Invoices will appear here when your design team sends them.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                        {filteredInvoices.map((invoice) => (
                            <motion.div key={invoice.id} variants={item}>
                                <Link
                                    href={`/invoices/${invoice.id}`}
                                    className="card-flat group flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-elevated transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${invoice.status === 'overdue'
                                            ? 'bg-red-50'
                                            : invoice.status === 'paid'
                                                ? 'bg-emerald-50'
                                                : 'bg-primary/10'
                                            }`}>
                                            <Receipt className={`w-5 h-5 ${invoice.status === 'overdue'
                                                ? 'text-red-600'
                                                : invoice.status === 'paid'
                                                    ? 'text-emerald-600'
                                                    : 'text-primary'
                                                }`} />
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                                                {invoice.title}
                                            </h3>
                                            <p className="text-xs text-text-secondary mt-0.5">
                                                {invoice.invoice_number} · Created {formatDate(invoice.created_at, { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="text-right">
                                            <p className="text-lg font-heading font-semibold text-text-primary">
                                                {formatCurrency(invoice.total, invoice.currency)}
                                            </p>
                                            {invoice.due_date && invoice.status !== 'paid' && (
                                                <p className="text-xs text-text-secondary">
                                                    Due {formatDate(invoice.due_date, { month: 'short', day: 'numeric' })}
                                                </p>
                                            )}
                                        </div>

                                        <span className={getStatusBadgeClass(invoice.status)}>
                                            {formatStatus(invoice.status)}
                                        </span>

                                        <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden sm:block flex-shrink-0" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}

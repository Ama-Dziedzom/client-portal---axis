'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { studioSupabase as supabase } from '@/lib/supabase'
import { Project, Client, InvoiceStatus } from '@/types/database'
import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Save, 
    FileText, 
    Loader2, 
    User, 
    FolderKanban,
    Calendar,
    Receipt,
    ListTodo
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface LineItem {
    description: string
    quantity: number
    unit_price: number
    amount: number
}

export default function NewInvoicePage() {
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form state
    const [clientId, setClientId] = useState('')
    const [projectId, setProjectId] = useState('')
    const [invoiceNumber, setInvoiceNumber] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [notes, setNotes] = useState('')
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { description: '', quantity: 1, unit_price: 0, amount: 0 }
    ])

    useEffect(() => {
        fetchInitialData()
        // Generate a random invoice number
        const now = new Date()
        const rnd = Math.floor(1000 + Math.random() * 9000)
        setInvoiceNumber(`INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2, '0')}-${rnd}`)
        
        // Default due date = 14 days from now
        const due = new Date()
        due.setDate(due.getDate() + 14)
        setDueDate(due.toISOString().split('T')[0])
    }, [])

    const fetchInitialData = async () => {
        try {
            const [clientsRes, projectsRes] = await Promise.all([
                supabase.from('clients').select('*').eq('active', true).order('name'),
                supabase.from('projects').select('*').eq('status', 'in_progress').order('title')
            ])
            setClients(clientsRes.data || [])
            setProjects(projectsRes.data || [])
        } catch (error) {
            console.error('Fetch error:', error)
            toast.error('Failed to load portal data')
        } finally {
            setLoading(false)
        }
    }

    const handleAddLineItem = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, amount: 0 }])
    }

    const handleRemoveLineItem = (index: number) => {
        if (lineItems.length === 1) return
        setLineItems(lineItems.filter((_, i) => i !== index))
    }

    const updateLineItem = (index: number, updates: Partial<LineItem>) => {
        const newItems = [...lineItems]
        const item = { ...newItems[index], ...updates }
        item.amount = item.quantity * item.unit_price
        newItems[index] = item
        setLineItems(newItems)
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
    const tax = subtotal * 0.16 // Example VAT
    const total = subtotal + tax

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!clientId || !projectId) {
            toast.error('Please select both client and project')
            return
        }

        setSaving(true)
        try {
            const { data, error } = await supabase
                .from('invoices')
                .insert({
                    client_id: clientId,
                    project_id: projectId,
                    invoice_number: invoiceNumber,
                    due_date: dueDate,
                    subtotal,
                    tax,
                    total,
                    status: 'draft' as InvoiceStatus,
                    line_items: lineItems,
                    notes
                })
                .select()
                .single()

            if (error) throw error

            toast.success('Invoice created as draft')
            router.push(`/studio/invoices`)
        } catch (error: any) {
            console.error('Error creating invoice:', error)
            toast.error(error.message || 'Failed to create invoice')
            setSaving(false)
        }
    }

    if (loading) return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin opacity-40" />
            </div>
        )

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-10">
                <Link 
                    href="/studio/invoices" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Invoices
                </Link>
                <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">Create New Invoice</h1>
                <p className="text-text-secondary font-body text-lg">Bill your client for project milestones and services</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Information Card */}
                        <div className="card-flat space-y-6">
                            <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" /> Invoice Details
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-text-primary">Invoice Number</label>
                                    <input
                                        type="text"
                                        value={invoiceNumber}
                                        onChange={e => setInvoiceNumber(e.target.value)}
                                        className="input-field font-mono"
                                        placeholder="INV-2024-001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-text-primary">Due Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={e => setDueDate(e.target.value)}
                                            className="input-field pl-11"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Line Items Card */}
                        <div className="card-flat">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                                    <ListTodo className="w-5 h-5 text-primary" /> Line Items
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleAddLineItem}
                                    className="btn-ghost text-xs group"
                                >
                                    <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Add Row
                                </button>
                            </div>

                            <div className="space-y-4">
                                {lineItems.map((item, idx) => (
                                    <div key={idx} className="group relative flex flex-col md:flex-row gap-4 p-5 rounded-2xl bg-accent/5 border border-transparent hover:border-primary/20 transition-all">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block sm:hidden">Description</label>
                                            <input
                                                type="text"
                                                placeholder="Service or item description..."
                                                value={item.description}
                                                onChange={e => updateLineItem(idx, { description: e.target.value })}
                                                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
                                            />
                                        </div>
                                        <div className="w-full md:w-24 space-y-2">
                                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block sm:hidden">Qty</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={e => updateLineItem(idx, { quantity: Number(e.target.value) })}
                                                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/10"
                                            />
                                        </div>
                                        <div className="w-full md:w-40 space-y-2">
                                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block sm:hidden">Price</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">K</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.unit_price}
                                                    onChange={e => updateLineItem(idx, { unit_price: Number(e.target.value) })}
                                                    className="w-full bg-white border border-border rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
                                                />
                                            </div>
                                        </div>
                                        <div className="hidden md:flex w-32 items-center justify-end font-bold text-sm text-text-primary pr-4">
                                            {new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(item.amount)}
                                        </div>
                                        {lineItems.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveLineItem(idx)}
                                                className="absolute -right-2 -top-2 md:static md:p-2 bg-white md:bg-transparent rounded-full shadow-sm md:shadow-none text-text-secondary hover:text-error hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="card-flat space-y-4">
                            <label className="text-sm font-semibold text-text-primary block">Payment Notes / Terms</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={3}
                                className="input-field resize-none py-4"
                                placeholder="Add payment instructions, wire details or specific project terms..."
                            />
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                        {/* Selector Card */}
                        <div className="card-flat space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Select Client</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                                    <select
                                        required
                                        value={clientId}
                                        onChange={e => setClientId(e.target.value)}
                                        className="w-full bg-accent/5 border border-border rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-medium"
                                    >
                                        <option value="">Choose Client...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Select Project</label>
                                <div className="relative">
                                    <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                                    <select
                                        required
                                        value={projectId}
                                        onChange={e => setProjectId(e.target.value)}
                                        className="w-full bg-accent/5 border border-border rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-medium"
                                    >
                                        <option value="">Choose Project...</option>
                                        {projects.filter(p => !clientId || p.client_id === clientId).map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Total Summary Card */}
                        <div className="card-flat bg-primary text-white border-none shadow-xl shadow-primary/20">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-accent/60 flex items-center gap-2">
                                <Receipt className="w-3.5 h-3.5" /> Summary
                            </h3>
                            
                            <div className="space-y-4 font-body">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Subtotal</span>
                                    <span className="font-semibold">{new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                                    <span className="text-white/60">Tax (16% VAT)</span>
                                    <span className="font-semibold">{new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(tax)}</span>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <span className="font-heading text-lg font-bold">Total Due</span>
                                    <span className="font-heading text-3xl font-bold text-accent">{new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(total)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving || !clientId || !projectId}
                                className="w-full mt-10 py-5 bg-white text-primary rounded-2xl font-bold text-base shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Create Invoice
                            </button>
                            <p className="mt-4 text-[10px] text-center text-white/40 font-bold uppercase tracking-widest">
                                Will be created as a Draft
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

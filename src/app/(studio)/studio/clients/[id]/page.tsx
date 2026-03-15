'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { studioSupabase as supabase } from '@/lib/supabase'
import { Client, Project, Invoice } from '@/types/database'
import { 
    ArrowLeft, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    FolderKanban, 
    Receipt, 
    Loader2, 
    User, 
    Plus,
    ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate, getInitials, getStatusBadgeClass, formatStatus } from '@/lib/utils'

export default function StudioClientDetailPage() {
    const { id } = useParams()
    const [client, setClient] = useState<Client | null>(null)
    const [projects, setProjects] = useState<Project[]>([])
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) fetchClientData()
    }, [id])

    const fetchClientData = async () => {
        try {
            const [clientRes, projectsRes, invoicesRes] = await Promise.all([
                supabase.from('clients').select('*').eq('id', id as string).single(),
                supabase.from('projects').select('*').eq('client_id', id as string).order('created_at', { ascending: false }),
                supabase.from('invoices').select('*').eq('client_id', id as string).order('created_at', { ascending: false })
            ])

            if (clientRes.error) throw clientRes.error
            setClient(clientRes.data)
            setProjects(projectsRes.data || [])
            setInvoices(invoicesRes.data || [])
        } catch (error) {
            console.error('Error fetching client details:', error)
            toast.error('Failed to load client profile')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin opacity-40" />
        </div>
    )

    if (!client) return (
        <div className="text-center py-20">
            <p className="text-text-secondary">Client not found</p>
            <Link href="/studio/clients" className="btn-ghost mt-4">Back to Clients</Link>
        </div>
    )

    const totalSpent = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total), 0)
    const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'planning')

    return (
        <div className="pb-20">
            {/* Header */}
            <div className="mb-10">
                <Link 
                    href="/studio/clients" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Clients
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-2xl font-bold text-primary shadow-inner">
                            {getInitials(client.name)}
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-text-primary tracking-tight">
                                {client.name}
                            </h1>
                            <div className="flex items-center gap-4 mt-2">
                                <span className={client.active ? "badge bg-emerald-50 text-emerald-700" : "badge bg-gray-50 text-gray-500"}>
                                    {client.active ? 'Active Portal Access' : 'Access Restricted'}
                                </span>
                                <span className="text-xs text-text-secondary font-medium uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" /> Joined {formatDate(client.created_at, { month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button className="btn-secondary">Edit Profile</button>
                        <Link href="/studio/projects/new" className="btn-primary">
                            <Plus className="w-4 h-4" /> New Project
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Information */}
                <div className="space-y-6">
                    <div className="card-flat">
                        <h3 className="font-heading text-sm font-semibold uppercase tracking-widest text-[#8b8fa3] mb-6 border-b border-border pb-4">Contact Details</h3>
                        <div className="space-y-5">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg shrink-0"><Mail className="w-4 h-4 text-blue-600" /></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">Email Address</p>
                                    <p className="text-sm font-medium text-text-primary truncate">{client.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-50 rounded-lg shrink-0"><Phone className="w-4 h-4 text-emerald-600" /></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">Phone Number</p>
                                    <p className="text-sm font-medium text-text-primary">{client.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg shrink-0"><MapPin className="w-4 h-4 text-amber-600" /></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">Address / Location</p>
                                    <p className="text-sm font-medium text-text-primary">{client.address || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-flat bg-primary text-white border-none">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-accent/60">Financial Snapshot</h3>
                        <div className="space-y-4 font-body">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Lifetime Billing</p>
                                    <p className="text-3xl font-heading font-bold text-accent">{formatCurrency(totalSpent)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-white/40 mb-1">{invoices.filter(i => i.status === 'paid').length} Invoices paid</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects and activity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Projects Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-heading font-semibold text-text-primary">Client Projects ({projects.length})</h2>
                            <Link href="/studio/projects" className="text-xs font-bold text-primary hover:underline">View all</Link>
                        </div>
                        
                        {projects.length === 0 ? (
                            <div className="card-flat text-center py-12 border-dashed border-2">
                                <FolderKanban className="w-10 h-10 text-accent/40 mx-auto mb-3" />
                                <p className="text-text-secondary text-sm">No projects started for this client yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.map(project => (
                                    <Link 
                                        key={project.id} 
                                        href={`/studio/projects/${project.id}`}
                                        className="card-flat group hover:border-primary/40 hover:shadow-elevated transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={getStatusBadgeClass(project.status)}>
                                                {formatStatus(project.status)}
                                            </span>
                                            <ExternalLink className="w-3.5 h-3.5 text-text-secondary group-hover:text-primary transition-colors" />
                                        </div>
                                        <h4 className="text-base font-heading font-semibold text-text-primary group-hover:text-primary transition-colors mb-1 line-clamp-1">
                                            {project.title}
                                        </h4>
                                        <p className="text-xs text-text-secondary italic">{project.location || 'No location'}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Invoices Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-heading font-semibold text-text-primary">Invoices</h2>
                            <Link href="/studio/invoices" className="text-xs font-bold text-primary hover:underline">Billing Hub</Link>
                        </div>
                        
                        {invoices.length === 0 ? (
                            <div className="card-flat text-center py-12 border-dashed border-2">
                                <Receipt className="w-10 h-10 text-accent/40 mx-auto mb-3" />
                                <p className="text-text-secondary text-sm">No billing records for this client.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {invoices.slice(0, 5).map(invoice => (
                                    <Link 
                                        key={invoice.id} 
                                        href={`/studio/invoices/${invoice.id}`}
                                        className="card-flat flex items-center justify-between p-4 group hover:bg-accent/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs font-mono font-bold text-text-primary group-hover:text-primary transition-colors">
                                                {invoice.invoice_number}
                                            </div>
                                            <div className="text-xs text-text-secondary">
                                                {formatDate(invoice.created_at)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-sm font-bold text-text-primary">
                                                {formatCurrency(invoice.total)}
                                            </div>
                                            <span className={getStatusBadgeClass(invoice.status)}>
                                                {formatStatus(invoice.status)}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

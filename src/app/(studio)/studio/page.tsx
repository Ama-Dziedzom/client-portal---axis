'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStudio } from '@/contexts/StudioContext'
import { studioSupabase as supabase } from '@/lib/supabase'
import { Client, Project, Invoice, Message } from '@/types/database'
import { formatCurrency, formatDate, formatStatus, getStatusBadgeClass } from '@/lib/utils'
import Link from 'next/link'
import {
    Users,
    FolderKanban,
    Receipt,
    MessageCircle,
    ArrowRight,
    TrendingUp,
    Clock,
    Plus,
    AlertCircle,
} from 'lucide-react'

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function StudioDashboardPage() {
    const { studioUser } = useStudio()
    const [clients, setClients] = useState<Client[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [recentMessages, setRecentMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [clientsRes, projectsRes, invoicesRes, messagesRes] = await Promise.all([
                supabase.from('clients').select('*').order('created_at', { ascending: false }),
                supabase.from('projects').select('*').order('updated_at', { ascending: false }),
                supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(10),
                supabase.from('messages').select('*').eq('sender_type', 'client').order('created_at', { ascending: false }).limit(10),
            ])

            setClients(clientsRes.data || [])
            setProjects(projectsRes.data || [])
            setInvoices(invoicesRes.data || [])
            setRecentMessages(messagesRes.data || [])
        } catch (error) {
            console.error('Studio dashboard fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 17) return 'Good afternoon'
        return 'Good evening'
    }

    const activeProjects = projects.filter(p => p.status === 'in_progress')
    const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue')
    const overdueInvoices = invoices.filter(i => i.status === 'overdue')
    const totalRevenue = invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + Number(i.total), 0)

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="skeleton h-12 w-72" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
                </div>
                <div className="skeleton h-64 rounded-2xl" />
            </div>
        )
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Greeting */}
            <motion.div variants={item} className="mb-10">
                <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">
                    {getGreeting()},{' '}
                    <span>{studioUser?.name?.split(' ')[0]}</span>
                </h1>
                <p className="text-text-secondary font-body text-lg">
                    Here&apos;s your studio overview
                </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <Link href="/studio/clients" className="group card-flat flex items-center gap-4 hover:shadow-elevated transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-semibold text-text-primary">{clients.length}</p>
                        <p className="text-sm text-text-secondary font-body">Clients</p>
                    </div>
                </Link>

                <Link href="/studio/projects" className="group card-flat flex items-center gap-4 hover:shadow-elevated transition-all duration-300">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <FolderKanban className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-semibold text-text-primary">{activeProjects.length}</p>
                        <p className="text-sm text-text-secondary font-body">Active Projects</p>
                    </div>
                </Link>

                <Link href="/studio/invoices" className="group card-flat flex items-center gap-4 hover:shadow-elevated transition-all duration-300">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${overdueInvoices.length > 0 ? 'bg-red-50 group-hover:bg-red-100' : 'bg-amber-50 group-hover:bg-amber-100'}`}>
                        <Receipt className={`w-5 h-5 ${overdueInvoices.length > 0 ? 'text-red-600' : 'text-amber-600'}`} />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-semibold text-text-primary">{pendingInvoices.length}</p>
                        <p className="text-sm text-text-secondary font-body">Pending Invoices</p>
                    </div>
                </Link>

                <div className="card-flat flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-heading font-semibold text-text-primary">{formatCurrency(totalRevenue)}</p>
                        <p className="text-sm text-text-secondary font-body">Total Revenue</p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={item} className="flex flex-wrap gap-3 mb-10">
                <Link href="/studio/projects/new" className="btn-primary">
                    <Plus className="w-4 h-4" /> New Project
                </Link>
                <Link href="/studio/invoices/new" className="btn-secondary">
                    <Plus className="w-4 h-4" /> New Invoice
                </Link>
                <Link href="/studio/clients" className="btn-secondary">
                    <Users className="w-4 h-4" /> Manage Clients
                </Link>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Projects */}
                <motion.div variants={item} className="lg:col-span-2">
                    <div className="section-header">
                        <h2 className="text-xl font-heading font-semibold text-text-primary">Recent Projects</h2>
                        <Link href="/studio/projects" className="btn-ghost text-xs">
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {projects.length === 0 ? (
                            <div className="card-flat text-center py-12">
                                <FolderKanban className="w-8 h-8 text-accent mx-auto mb-3" />
                                <p className="text-text-secondary text-sm">No projects yet. Create your first project.</p>
                            </div>
                        ) : (
                            projects.slice(0, 5).map(project => (
                                <Link
                                    key={project.id}
                                    href={`/studio/projects/${project.id}`}
                                    className="card-flat group flex items-center gap-4 hover:shadow-elevated transition-all duration-300"
                                >
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FolderKanban className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                                            {project.title}
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">
                                            {project.location || 'No location'} · Updated {formatDate(project.updated_at, { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <span className={getStatusBadgeClass(project.status)}>
                                        {formatStatus(project.status)}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors hidden sm:block" />
                                </Link>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Recent Client Messages */}
                <motion.div variants={item}>
                    <div className="section-header">
                        <h2 className="text-xl font-heading font-semibold text-text-primary">Client Messages</h2>
                        <Link href="/studio/messages" className="btn-ghost text-xs">
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="card-flat p-0 overflow-hidden">
                        {recentMessages.length === 0 ? (
                            <div className="p-6 text-center">
                                <MessageCircle className="w-8 h-8 text-accent mx-auto mb-3" />
                                <p className="text-text-secondary text-sm">No client messages yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {recentMessages.slice(0, 5).map(msg => (
                                    <Link
                                        key={msg.id}
                                        href="/studio/messages"
                                        className="flex items-start gap-3 p-4 hover:bg-accent/5 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MessageCircle className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-text-primary truncate">{msg.sender_name}</p>
                                            <p className="text-xs text-text-secondary mt-0.5 truncate">{msg.body}</p>
                                        </div>
                                        <span className="text-[10px] text-text-secondary flex-shrink-0">
                                            {formatDate(msg.created_at, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Overdue invoices alert */}
                    {overdueInvoices.length > 0 && (
                        <div className="mt-5 bg-red-50 border border-red-200 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Overdue</span>
                            </div>
                            <p className="text-sm text-red-800 font-body leading-relaxed">
                                {overdueInvoices.length} invoice{overdueInvoices.length > 1 ? 's are' : ' is'} overdue. Follow up with your clients.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    )
}

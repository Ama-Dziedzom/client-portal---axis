'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Project, Invoice, Message, TimelineStage } from '@/types/database'
import { formatCurrency, formatDate, formatStatus, getStatusBadgeClass, calculateProgress } from '@/lib/utils'
import Link from 'next/link'
import {
    FolderKanban,
    Receipt,
    MessageCircle,
    ArrowRight,
    Clock,

    AlertCircle,
    TrendingUp,
    Calendar,
    Sparkles,
} from 'lucide-react'
import { useDashboard } from '@/contexts/DashboardContext'
import PageHeader from '@/components/dashboard/PageHeader'

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
}

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function DashboardPage() {
    const { client } = useAuth()
    const { project } = useDashboard()
    const [projects, setProjects] = useState<(Project & { timeline_stages: TimelineStage[] })[]>([])
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [recentMessages, setRecentMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (client) {
            fetchDashboardData()
        } else if (!client && loading) {
            // If we don't have a client and are not fetching data, ensure we stop loading
            // But usually the client is fetched by AuthProvider. 
            // If it fails, we should still stop the page spinner.
            const timer = setTimeout(() => {
                setLoading(false)
            }, 2000) // Fallback timeout
            return () => clearTimeout(timer)
        }
    }, [client])

    const fetchDashboardData = async () => {
        try {
            const [projectsRes, invoicesRes, messagesRes] = await Promise.all([
                supabase
                    .from('projects')
                    .select('*, timeline_stages(*)')
                    .eq('client_id', client!.id)
                    .order('updated_at', { ascending: false }),
                supabase
                    .from('invoices')
                    .select('*')
                    .eq('client_id', client!.id)
                    .order('created_at', { ascending: false })
                    .limit(5),
                supabase
                    .from('messages')
                    .select('*')
                    .in(
                        'project_id',
                        (await supabase.from('projects').select('id').eq('client_id', client!.id)).data?.map((p) => p.id) || []
                    )
                    .order('created_at', { ascending: false })
                    .limit(5),
            ])

            setProjects((projectsRes.data as any) || [])
            setInvoices(invoicesRes.data || [])
            setRecentMessages(messagesRes.data || [])
        } catch (error) {
            console.error('Dashboard fetch error:', error)
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

    const activeProjects = projects.filter((p) => p.status === 'in_progress')
    const pendingInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue')
    const unreadMessages = recentMessages.filter((m) => !m.read && m.sender_type === 'studio')

    if (loading) {
        return (
            <div className="page-container">
                <div className="space-y-8">
                    <div className="skeleton h-12 w-72" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-32 rounded-2xl" />
                        ))}
                    </div>
                    <div className="skeleton h-64 rounded-2xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <motion.div variants={container} initial="hidden" animate="show">
                {/* Page Header */}
                <motion.div variants={item} className="mb-10">
                    <PageHeader
                        title={project?.title || 'Your Project'}
                        location={project?.location}
                        status={project?.status}
                    />
                </motion.div>

                {/* Greeting */}
                <motion.div variants={item} className="mb-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-heading font-light text-text-primary mb-2">
                                {getGreeting()},{' '}
                                <span className="font-semibold">{client?.name?.split(' ')[0]}</span>
                            </h2>
                            <p className="text-text-secondary font-body text-lg">
                                Here&apos;s what&apos;s happening with your projects
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-sm text-text-secondary bg-surface border border-border rounded-xl px-4 py-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-body">{formatDate(new Date())}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                    <Link href="/projects" className="group card-flat flex items-center gap-5 hover:shadow-elevated transition-shadow duration-300">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                            <FolderKanban className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-3xl font-heading font-semibold text-text-primary">{activeProjects.length}</p>
                            <p className="text-sm text-text-secondary font-body">Active Projects</p>
                        </div>
                    </Link>

                    <Link href="/invoices" className="group card-flat flex items-center gap-5 hover:shadow-elevated transition-shadow duration-300">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${pendingInvoices.length > 0 ? 'bg-amber-50 group-hover:bg-amber-100' : 'bg-accent/15 group-hover:bg-accent/25'}`}>
                            <Receipt className={`w-6 h-6 ${pendingInvoices.length > 0 ? 'text-amber-600' : 'text-primary'}`} />
                        </div>
                        <div>
                            <p className="text-3xl font-heading font-semibold text-text-primary">{pendingInvoices.length}</p>
                            <p className="text-sm text-text-secondary font-body">Pending Invoices</p>
                        </div>
                    </Link>

                    <Link href="/messages" className="group card-flat flex items-center gap-5 hover:shadow-elevated transition-shadow duration-300">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${unreadMessages.length > 0 ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-accent/15 group-hover:bg-accent/25'}`}>
                            <MessageCircle className={`w-6 h-6 ${unreadMessages.length > 0 ? 'text-blue-600' : 'text-primary'}`} />
                        </div>
                        <div>
                            <p className="text-3xl font-heading font-semibold text-text-primary">{unreadMessages.length}</p>
                            <p className="text-sm text-text-secondary font-body">New Messages</p>
                        </div>
                    </Link>
                </motion.div>

                {/* Projects + Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Projects */}
                    <motion.div variants={item} className="lg:col-span-2">
                        <div className="section-header">
                            <h2 className="text-xl font-heading font-semibold text-text-primary">Your Projects</h2>
                            <Link href="/projects" className="btn-ghost text-xs">
                                View all <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {projects.length === 0 ? (
                            <div className="card-flat flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 bg-accent/15 rounded-2xl flex items-center justify-center mb-4">
                                    <Sparkles className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
                                    No projects yet
                                </h3>
                                <p className="text-sm text-text-secondary max-w-sm">
                                    When your design team creates a project for you, it will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {projects.slice(0, 4).map((project) => {
                                    const stages = project.timeline_stages || []
                                    const progress = calculateProgress(stages)

                                    return (
                                        <Link
                                            key={project.id}
                                            href={`/projects/${project.id}`}
                                            className="card-flat group flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-elevated transition-all duration-300"
                                        >
                                            {/* Cover */}
                                            <div className="w-full sm:w-24 h-32 sm:h-20 bg-accent/10 rounded-xl overflow-hidden flex-shrink-0">
                                                {project.cover_image_url ? (
                                                    <img
                                                        src={project.cover_image_url}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <FolderKanban className="w-8 h-8 text-accent" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="font-heading text-base font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                                                            {project.title}
                                                        </h3>
                                                        {project.location && (
                                                            <p className="text-xs text-text-secondary mt-0.5">{project.location}</p>
                                                        )}
                                                    </div>
                                                    <span className={getStatusBadgeClass(project.status)}>
                                                        {formatStatus(project.status)}
                                                    </span>
                                                </div>

                                                {/* Progress bar */}
                                                {stages.length > 0 && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
                                                            <span>{progress}% complete</span>
                                                            <span>{stages.filter((s) => s.status === 'complete').length}/{stages.length} stages</span>
                                                        </div>
                                                        <div className="h-1.5 bg-accent/15 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${progress}%` }}
                                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                                className="h-full bg-primary rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden sm:block flex-shrink-0" />
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div variants={item}>
                        <div className="section-header">
                            <h2 className="text-xl font-heading font-semibold text-text-primary">Recent Activity</h2>
                        </div>

                        <div className="card-flat p-0 overflow-hidden">
                            {recentMessages.length === 0 && pendingInvoices.length === 0 ? (
                                <div className="p-6 text-center">
                                    <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
                                    <p className="text-sm text-text-secondary">No recent activity</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {/* Pending invoices */}
                                    {pendingInvoices.slice(0, 2).map((inv) => (
                                        <Link
                                            key={inv.id}
                                            href={`/invoices/${inv.id}`}
                                            className="flex items-start gap-3 p-4 hover:bg-accent/5 transition-colors"
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${inv.status === 'overdue' ? 'bg-red-50' : 'bg-amber-50'}`}>
                                                {inv.status === 'overdue' ? (
                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <Receipt className="w-4 h-4 text-amber-600" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-text-primary truncate">
                                                    {inv.title}
                                                </p>
                                                <p className="text-xs text-text-secondary mt-0.5">
                                                    {formatCurrency(inv.total, inv.currency)} · {inv.status === 'overdue' ? 'Overdue' : 'Due'}{' '}
                                                    {inv.due_date ? formatDate(inv.due_date, { month: 'short', day: 'numeric' }) : '—'}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}

                                    {/* Recent messages */}
                                    {recentMessages.slice(0, 3).map((msg) => (
                                        <Link
                                            key={msg.id}
                                            href="/messages"
                                            className="flex items-start gap-3 p-4 hover:bg-accent/5 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <MessageCircle className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-text-primary truncate">
                                                    {msg.sender_name}
                                                </p>
                                                <p className="text-xs text-text-secondary mt-0.5 truncate">
                                                    {msg.body}
                                                </p>
                                            </div>
                                            {!msg.read && msg.sender_type === 'studio' && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick tip card */}
                        <div className="mt-5 bg-primary/5 border border-primary/10 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <span className="text-xs font-semibold text-primary uppercase tracking-wider font-body">Tip</span>
                            </div>
                            <p className="text-sm text-text-primary/80 font-body leading-relaxed">
                                Use the Messages tab to communicate directly with your design team. They usually respond within 24 hours.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

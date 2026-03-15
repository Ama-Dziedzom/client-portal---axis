'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { studioSupabase as supabase } from '@/lib/supabase'
import { Client, Project } from '@/types/database'
import { formatDate, getInitials } from '@/lib/utils'
import Link from 'next/link'
import { Users, Search, Plus, ArrowRight, FolderKanban, Mail, Phone, Sparkles } from 'lucide-react'

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function StudioClientsPage() {
    const [clients, setClients] = useState<(Client & { project_count: number })[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            const { data: clientsData, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            // Get project counts per client
            const { data: projects } = await supabase.from('projects').select('client_id')

            const projectCounts: Record<string, number> = {}
            ;(projects || []).forEach((p: any) => {
                projectCounts[p.client_id] = (projectCounts[p.client_id] || 0) + 1
            })

            setClients(
                (clientsData || []).map(c => ({
                    ...c,
                    project_count: projectCounts[c.id] || 0,
                }))
            )
        } catch (error) {
            console.error('Error fetching clients:', error)
        } finally {
            setLoading(false)
        }
    }

    const filtered = searchQuery
        ? clients.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : clients

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="skeleton h-10 w-48" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
                </div>
            </div>
        )
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">Clients</h1>
                    <p className="text-text-secondary font-body text-lg">Manage your client accounts</p>
                </div>
                <Link href="/studio/clients/new" className="btn-primary w-full sm:w-auto">
                    <Plus className="w-4 h-4" /> New Client
                </Link>
            </motion.div>

            {/* Search */}
            {clients.length > 0 && (
                <motion.div variants={item} className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-11"
                        />
                    </div>
                </motion.div>
            )}

            {/* Client List */}
            {filtered.length === 0 ? (
                <motion.div variants={item} className="card-flat flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-accent/15 rounded-2xl flex items-center justify-center mb-4">
                        <Sparkles className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
                        {searchQuery ? 'No matching clients' : 'No clients yet'}
                    </h3>
                    <p className="text-sm text-text-secondary max-w-sm">
                        {searchQuery ? 'Try a different search.' : 'Clients will appear here when they sign up through the portal.'}
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                    {filtered.map(client => (
                        <motion.div key={client.id} variants={item}>
                            <Link
                                href={`/studio/clients/${client.id}`}
                                className="card-flat group flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-elevated transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-bold text-primary">{getInitials(client.name)}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                                            {client.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-text-secondary flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {client.email}
                                            </span>
                                            {client.phone && (
                                                <span className="text-xs text-text-secondary flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {client.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                        <FolderKanban className="w-3.5 h-3.5" />
                                        <span>{client.project_count} project{client.project_count !== 1 ? 's' : ''}</span>
                                    </div>
                                    <span className={`badge ${client.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                        {client.active ? 'Active' : 'Inactive'}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors hidden sm:block" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { studioSupabase as supabase } from '@/lib/supabase'
import { Project, Client } from '@/types/database'
import { formatStatus, getStatusBadgeClass, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { 
    FolderKanban, 
    Search, 
    Plus, 
    Filter,
    MapPin,
    Calendar,
    ArrowRight
} from 'lucide-react'

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function StudioProjectsPage() {
    const [projects, setProjects] = useState<(Project & { client_name?: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const { data: projectsData, error } = await supabase
                .from('projects')
                .select('*')
                .order('updated_at', { ascending: false })

            if (error) throw error

            // Fetch client names
            const { data: clients } = await supabase.from('clients').select('id, name')
            const clientMap = Object.fromEntries(clients?.map(c => [c.id, c.name]) || [])

            setProjects(
                (projectsData || []).map(p => ({
                    ...p,
                    client_name: clientMap[p.client_id] || 'Unknown Client',
                }))
            )
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const filtered = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter
        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="skeleton h-10 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
                </div>
            </div>
        )
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">Projects</h1>
                    <p className="text-text-secondary font-body text-lg">Manage and track project progress</p>
                </div>
                <Link href="/studio/projects/new" className="btn-primary w-full sm:w-auto">
                    <Plus className="w-4 h-4" /> New Project
                </Link>
            </motion.div>

            {/* Filters */}
            <motion.div variants={item} className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search projects or clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-11"
                    />
                </div>
                <div className="relative min-w-[180px]">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field pl-11 appearance-none bg-white cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="planning">Planning</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="complete">Complete</option>
                    </select>
                </div>
            </motion.div>

            {/* Project Grid */}
            {filtered.length === 0 ? (
                <motion.div variants={item} className="card-flat flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-accent/15 rounded-2xl flex items-center justify-center mb-4">
                        <FolderKanban className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">No projects found</h3>
                    <p className="text-sm text-text-secondary max-w-sm mb-6">
                        {searchQuery || statusFilter !== 'all' 
                            ? "Try adjusting your filters or search terms." 
                            : "Get started by creating your first project."}
                    </p>
                    {!(searchQuery || statusFilter !== 'all') && (
                        <Link href="/studio/projects/new" className="btn-primary">
                             Create Project
                        </Link>
                    )}
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((project) => (
                        <motion.div key={project.id} variants={item}>
                            <Link
                                href={`/studio/projects/${project.id}`}
                                className="card-flat group flex flex-col h-full hover:shadow-elevated transition-all duration-300"
                            >
                                <div className="p-1">
                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <span className={getStatusBadgeClass(project.status)}>
                                            {formatStatus(project.status)}
                                        </span>
                                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                                            {project.location}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-heading font-semibold text-text-primary group-hover:text-primary transition-colors mb-2 line-clamp-1">
                                        {project.title}
                                    </h3>
                                    
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                            {project.client_name?.[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-text-secondary">{project.client_name}</span>
                                    </div>

                                    <div className="space-y-3 mt-auto pt-4 border-t border-border">
                                        <div className="flex items-center justify-between text-xs text-text-secondary">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>Updated {formatDate(project.updated_at, { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-1 group-hover:text-primary transition-colors font-semibold">
                                                Manage <ArrowRight className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}

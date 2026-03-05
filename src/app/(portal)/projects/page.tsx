'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Project, TimelineStage } from '@/types/database'
import { formatStatus, getStatusBadgeClass, calculateProgress } from '@/lib/utils'
import Link from 'next/link'
import { FolderKanban, ArrowRight, MapPin, Sparkles } from 'lucide-react'

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ProjectsPage() {
    const { client } = useAuth()
    const [projects, setProjects] = useState<(Project & { timeline_stages: TimelineStage[] })[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        if (client) fetchProjects()
    }, [client])

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*, timeline_stages(*)')
                .eq('client_id', client!.id)
                .order('updated_at', { ascending: false })

            if (error) throw error
            setProjects((data as any) || [])
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter((p) => p.status === filter)

    const statusFilters = [
        { value: 'all', label: 'All' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'planning', label: 'Planning' },
        { value: 'complete', label: 'Complete' },
        { value: 'on_hold', label: 'On Hold' },
    ]

    if (loading) {
        return (
            <div className="page-container">
                <div className="skeleton h-10 w-48 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton h-64 rounded-2xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">
                    Your Projects
                </h1>
                <p className="text-text-secondary font-body text-lg">
                    Track every detail of your design journey
                </p>
            </div>

            {/* Filters */}
            {projects.length > 0 && (
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
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
                            {f.value !== 'all' && (
                                <span className="ml-1.5 text-xs opacity-70">
                                    {projects.filter((p) => p.status === f.value).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <div className="card-flat flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-accent/15 rounded-2xl flex items-center justify-center mb-4">
                        <Sparkles className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
                        {filter === 'all' ? 'No projects yet' : `No ${formatStatus(filter).toLowerCase()} projects`}
                    </h3>
                    <p className="text-sm text-text-secondary max-w-sm">
                        {filter === 'all'
                            ? 'Projects will appear here once your design team creates them.'
                            : 'Try selecting a different filter.'}
                    </p>
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {filteredProjects.map((project) => {
                        const stages = project.timeline_stages || []
                        const progress = calculateProgress(stages)

                        return (
                            <motion.div key={project.id} variants={item}>
                                <Link href={`/projects/${project.id}`} className="group block">
                                    <div className="card-flat overflow-hidden hover:shadow-elevated transition-all duration-300">
                                        {/* Cover image */}
                                        <div className="h-48 -mx-6 -mt-6 mb-5 bg-accent/10 overflow-hidden relative">
                                            {project.cover_image_url ? (
                                                <img
                                                    src={project.cover_image_url}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
                                                    <FolderKanban className="w-12 h-12 text-accent/60" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4">
                                                <span className={getStatusBadgeClass(project.status)}>
                                                    {formatStatus(project.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <h3 className="font-heading text-lg font-semibold text-text-primary group-hover:text-primary transition-colors mb-1">
                                            {project.title}
                                        </h3>

                                        {project.location && (
                                            <div className="flex items-center gap-1.5 text-sm text-text-secondary mb-3">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{project.location}</span>
                                            </div>
                                        )}

                                        {project.description && (
                                            <p className="text-sm text-text-secondary font-body line-clamp-2 mb-4">
                                                {project.description}
                                            </p>
                                        )}

                                        {/* Progress */}
                                        {stages.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
                                                    <span>{progress}% complete</span>
                                                    <span>{stages.filter((s) => s.status === 'complete').length}/{stages.length} stages</span>
                                                </div>
                                                <div className="h-1.5 bg-accent/15 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${progress}%` }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                                        className="h-full bg-primary rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t border-border">
                                            <span className="text-xs text-text-secondary font-body">
                                                {project.estimated_completion
                                                    ? `Est. completion: ${new Date(project.estimated_completion).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
                                                    : 'Timeline TBD'}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                View details <ArrowRight className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </motion.div>
            )}
        </div>
    )
}

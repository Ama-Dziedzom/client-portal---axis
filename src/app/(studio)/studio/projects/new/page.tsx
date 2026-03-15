'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { studioSupabase as supabase } from '@/lib/supabase'
import { Client, ProjectStatus } from '@/types/database'
import { ArrowLeft, Loader2, Save, Sparkles, User } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function NewProjectPage() {
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [clientId, setClientId] = useState('')
    const [location, setLocation] = useState('')
    const [status, setStatus] = useState<ProjectStatus>('planning')
    const [description, setDescription] = useState('')

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('active', true)
                .order('name', { ascending: true })

            if (error) throw error
            setClients(data || [])
        } catch (error) {
            console.error('Error fetching clients:', error)
            toast.error('Failed to load clients')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!clientId) {
            toast.error('Please select a client')
            return
        }

        setSaving(true)
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert({
                    title,
                    client_id: clientId,
                    location,
                    status,
                    description,
                })
                .select()
                .single()

            if (error) throw error

            toast.success('Project created successfully!')
            router.push(`/studio/projects/${data.id}`)
        } catch (error: any) {
            console.error('Error creating project:', error)
            toast.error(error.message || 'Failed to create project')
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin opacity-40" />
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Breadcrumbs */}
            <motion.div variants={item} initial="hidden" animate="show" className="mb-8">
                <Link 
                    href="/studio/projects" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Projects
                </Link>
                <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">Create Project</h1>
                <p className="text-text-secondary font-body text-lg">Set up a new space for your client</p>
            </motion.div>

            <motion.form 
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-flat space-y-8"
            >
                <div className="space-y-6">
                    {/* Project Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-primary ml-1">Project Title</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Modern Hills Residence"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {/* Client Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-primary ml-1">Client</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                            <select
                                required
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="input-field pl-11 appearance-none bg-white font-body"
                            >
                                <option value="" disabled>Select a client...</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.name} ({client.email})
                                    </option>
                                ))}
                            </select>
                            {clients.length === 0 && (
                                <p className="text-xs text-amber-600 mt-2 ml-1">
                                    No active clients found. Create a client first.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Location & Status Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-primary ml-1">Location</label>
                            <input
                                type="text"
                                placeholder="e.g. Lusaka, Zambia"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-primary ml-1">Initial Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                                className="input-field appearance-none bg-white"
                            >
                                <option value="planning">Planning</option>
                                <option value="in_progress">In Progress</option>
                                <option value="on_hold">On Hold</option>
                                <option value="complete">Complete</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-primary ml-1">Description</label>
                        <textarea
                            rows={4}
                            placeholder="Briefly describe the project scope..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input-field resize-none py-3"
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary flex-1 py-4 shadow-lg shadow-primary/10"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Create Project
                            </>
                        )}
                    </button>
                    <Link
                        href="/studio/projects"
                        className="btn-secondary flex-1 py-4"
                    >
                        Cancel
                    </Link>
                </div>
            </motion.form>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex items-center justify-center gap-2 p-6 rounded-2xl bg-primary/5 text-primary/60 border border-primary/10"
            >
                <Sparkles className="w-4 h-4" />
                <p className="text-xs font-medium">After creation, you can add timeline stages, documents, and gallery images.</p>
            </motion.div>
        </div>
    )
}

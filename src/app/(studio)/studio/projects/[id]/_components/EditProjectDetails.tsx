'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Loader2, Save as SaveIcon } from 'lucide-react'
import { ProjectStatus } from '@/types/database'

interface EditProjectDetailsProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    initialData: {
        title: string
        location: string
        status: ProjectStatus
        description: string
    }
}

export function EditProjectDetails({ isOpen, onClose, onSave, initialData }: EditProjectDetailsProps) {
    const [form, setForm] = useState(initialData)
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await onSave(form)
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-10 overflow-hidden"
                >
                    <form onSubmit={handleSubmit} className="card-flat bg-accent/5 border-primary/20 p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-text-primary">Title</label>
                                <input 
                                    type="text" 
                                    value={form.title} 
                                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="input-field bg-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-text-primary">Location</label>
                                <input 
                                    type="text" 
                                    value={form.location} 
                                    onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                                    className="input-field bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-text-primary">Status</label>
                                <select 
                                    value={form.status} 
                                    onChange={e => setForm(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                                    className="input-field bg-white"
                                >
                                    <option value="planning">Planning</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="complete">Complete</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-text-primary">Description</label>
                                <textarea 
                                    value={form.description} 
                                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="input-field bg-white h-full"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                            <button type="submit" disabled={saving} className="btn-primary">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

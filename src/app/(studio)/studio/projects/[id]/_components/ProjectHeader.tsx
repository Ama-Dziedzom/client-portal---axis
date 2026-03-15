'use client'

import { ArrowLeft, Edit2, Trash2, MapPin } from 'lucide-react'
import Link from 'next/link'
import { ProjectStatus } from '@/types/database'
import { formatStatus, getStatusBadgeClass } from '@/lib/utils'

interface ProjectHeaderProps {
    project: {
        title: string
        status: ProjectStatus
        location: string | null
    }
    onEdit: () => void
    onDelete: () => void
}

export function ProjectHeader({ project, onEdit, onDelete }: ProjectHeaderProps) {
    return (
        <div className="mb-10">
            <Link 
                href="/studio/projects" 
                className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Projects
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={getStatusBadgeClass(project.status)}>
                            {formatStatus(project.status)}
                        </span>
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> {project.location || 'No location'}
                        </span>
                    </div>
                    <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-text-primary tracking-tight">
                        {project.title}
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onEdit}
                        className="btn-secondary"
                    >
                        <Edit2 className="w-4 h-4" /> Edit Details
                    </button>
                    <button 
                        onClick={onDelete}
                        className="btn-ghost text-error hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

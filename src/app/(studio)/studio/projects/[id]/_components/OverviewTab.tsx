'use client'

import { LayoutDashboard, MessageSquare, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { ProjectWithDetails } from '@/types/database'
import { formatDate } from '@/lib/utils'

interface OverviewTabProps {
    project: ProjectWithDetails
}

export function OverviewTab({ project }: OverviewTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="card-flat">
                    <h3 className="font-heading text-lg font-semibold mb-4">Project Description</h3>
                    <p className="text-text-secondary font-body leading-relaxed whitespace-pre-wrap italic">
                        {project.description || 'No description provided.'}
                    </p>
                </div>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="card-flat bg-primary/5 border-primary/10">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Timeline</p>
                        <p className="text-xl font-heading font-bold text-text-primary">
                            {project.timeline_stages?.filter(s => s.status === 'complete').length || 0} / {project.timeline_stages?.length || 0}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">Stages complete</p>
                    </div>
                    <div className="card-flat bg-blue-50/50 border-blue-100">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Documents</p>
                        <p className="text-xl font-heading font-bold text-text-primary">
                            {project.documents?.length || 0}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">Files shared</p>
                    </div>
                    <div className="card-flat bg-emerald-50/50 border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Gallery</p>
                        <p className="text-xl font-heading font-bold text-text-primary">
                            {project.gallery?.length || 0}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">Images uploaded</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="card-flat">
                    <h3 className="font-heading text-sm font-semibold uppercase tracking-widest text-[#8b8fa3] mb-6">Internal Info</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-bold text-text-secondary mb-1 uppercase tracking-tighter">Client ID</p>
                            <p className="text-sm font-medium font-mono text-text-primary bg-accent/5 p-2 rounded-lg truncate">
                                {project.client_id}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-secondary mb-1 uppercase tracking-tighter">Created At</p>
                            <p className="text-sm font-medium text-text-primary">
                                {formatDate(project.created_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-secondary mb-1 uppercase tracking-tighter">Last Update</p>
                            <p className="text-sm font-medium text-text-primary">
                                {formatDate(project.updated_at)}
                            </p>
                        </div>
                    </div>
                </div>
                
                <Link 
                    href="/studio/messages"
                    className="card-flat bg-primary text-white flex items-center justify-between group hover:bg-primary-light transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-accent" />
                        <div>
                            <p className="text-sm font-bold">Client Messages</p>
                            <p className="text-[10px] text-accent/60 uppercase">Open Hub</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}

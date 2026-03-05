'use client'

import React from 'react'
import { MapPin } from 'lucide-react'
import { ProjectStatus } from '@/types/database'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
    title: string
    location?: string | null
    status?: ProjectStatus
    className?: string
}

const statusConfig: Record<ProjectStatus, { label: string, className: string }> = {
    planning: {
        label: 'Planning',
        className: 'bg-gray-100 text-gray-600 border-gray-200'
    },
    in_progress: {
        label: 'In Progress',
        className: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    on_hold: {
        label: 'On Hold',
        className: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    complete: {
        label: 'Complete',
        className: 'bg-green-50 text-green-700 border-green-200'
    },
}

export default function PageHeader({ title, location, status, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8", className)}>
            <div className="flex-1">
                <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#2F402C] font-semibold tracking-tight">
                    {title}
                </h1>

                {(location || status) && (
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        {location && (
                            <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                                <MapPin className="w-4 h-4" />
                                <span>{location}</span>
                            </div>
                        )}

                        {status && (
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold border",
                                statusConfig[status].className
                            )}>
                                {statusConfig[status].label}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

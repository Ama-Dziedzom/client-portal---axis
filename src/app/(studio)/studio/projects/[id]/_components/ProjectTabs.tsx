'use client'

import { LayoutDashboard, CheckCircle2, ImageIcon, FileText, LucideIcon } from 'lucide-react'

interface Tab {
    id: string
    label: string
    icon: LucideIcon
}

export const tabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'timeline', label: 'Timeline', icon: CheckCircle2 },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'documents', label: 'Documents', icon: FileText },
]

interface ProjectTabsProps {
    activeTab: string
    onTabChange: (id: string) => void
}

export function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
    return (
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map(tab => {
                const Icon = tab.icon
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
                            ${activeTab === tab.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                : "bg-white text-text-secondary hover:bg-accent/10 border border-border"
                            }
                        `}
                    >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}

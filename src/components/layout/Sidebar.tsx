'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    GitBranch,
    Image,
    FileText,
    MessageSquare,
    Receipt,
    LogOut
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboard } from '@/contexts/DashboardContext'
import { cn } from '@/lib/utils'

const navItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Timeline', icon: GitBranch, href: '/dashboard/timeline' },
    { label: 'Moodboard', icon: Image, href: '/dashboard/moodboard' },
    { label: 'Documents', icon: FileText, href: '/dashboard/documents' },
    { label: 'Messages', icon: MessageSquare, href: '/dashboard/messages', showBadge: true },
    { label: 'Invoices', icon: Receipt, href: '/dashboard/invoices' },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { signOut, client } = useAuth()
    const { unreadCount } = useDashboard()

    return (
        <aside className="hidden lg:flex w-[240px] flex-col fixed inset-y-0 left-0 bg-[#2F402C] z-50">
            {/* Top Section */}
            <div className="p-8">
                <Link href="/dashboard" className="block mb-1">
                    <h1 className="text-white font-heading text-[22px] font-semibold leading-tight">
                        Axis Living
                    </h1>
                </Link>
                <div className="text-[#C6B9AA] text-[10px] font-bold tracking-[0.1em] uppercase">
                    Client Portal
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative overflow-hidden",
                                isActive
                                    ? "bg-white/10 text-[#C6B9AA]"
                                    : "text-white hover:bg-white/10"
                            )}
                        >
                            {/* Active indicator border */}
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white" />
                            )}

                            <Icon className={cn("w-5 h-5", isActive ? "text-[#C6B9AA]" : "text-white")} />
                            <span className="flex-1">{item.label}</span>

                            {item.showBadge && unreadCount > 0 && (
                                <span className="bg-[#C6B9AA] text-[#2F402C] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-6 border-t border-white/10">
                <div className="mb-4">
                    <div className="text-white text-sm font-medium truncate">
                        {client?.name || 'Client Name'}
                    </div>
                    <div className="text-[#C6B9AA] text-xs truncate">
                        {client?.email || 'client@email.com'}
                    </div>
                </div>
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-[#C6B9AA] text-sm font-medium hover:text-white transition-colors py-2"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    )
}

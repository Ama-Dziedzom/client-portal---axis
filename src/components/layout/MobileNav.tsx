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
    X,
    LogOut
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

interface MobileNavProps {
    isOpen: boolean
    onClose: () => void
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
    const pathname = usePathname()
    const { signOut, client } = useAuth()
    const { unreadCount } = useDashboard()

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 w-[280px] bg-[#2F402C] z-[101] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b border-white/10">
                            <div>
                                <h1 className="text-white font-heading text-xl font-semibold leading-tight">
                                    Axis Living
                                </h1>
                                <div className="text-[#C6B9AA] text-[10px] font-bold tracking-[0.1em] uppercase">
                                    Client Portal
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-white/60 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium transition-all relative",
                                            isActive
                                                ? "bg-white/10 text-[#C6B9AA]"
                                                : "text-white hover:bg-white/5 active:bg-white/10"
                                        )}
                                    >
                                        <Icon className={cn("w-6 h-6", isActive ? "text-[#C6B9AA]" : "text-white/80")} />
                                        <span className="flex-1">{item.label}</span>

                                        {item.showBadge && unreadCount > 0 && (
                                            <span className="bg-[#C6B9AA] text-[#2F402C] text-xs font-bold px-2 py-0.5 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-black/10">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold">
                                    {client?.name?.[0]?.toUpperCase() || 'C'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white text-sm font-medium truncate">
                                        {client?.name || 'Client Name'}
                                    </div>
                                    <div className="text-[#C6B9AA] text-xs truncate">
                                        {client?.email || 'client@email.com'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    onClose()
                                    signOut()
                                }}
                                className="w-full flex items-center justify-center gap-2 text-[#C6B9AA] text-sm font-semibold border border-white/10 rounded-xl py-3 hover:bg-white/5 hover:text-white transition-all active:scale-95"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

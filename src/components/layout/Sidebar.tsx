'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    MessageCircle,
    Receipt,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getInitials } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: '/invoices', label: 'Invoices', icon: Receipt },
    { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { client, signOut } = useAuth()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-surface border border-border rounded-xl shadow-soft"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5 text-text-primary" />
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`
          fixed top-0 left-0 z-50 h-full bg-surface border-r border-border
          flex flex-col
          transition-all duration-300 ease-out
          ${collapsed ? 'w-20' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative
        `}
            >
                {/* Logo / Brand */}
                <div className={`flex items-center h-20 border-b border-border ${collapsed ? 'justify-center px-4' : 'px-8'}`}>
                    {!collapsed && (
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <span className="text-white font-heading text-lg font-semibold">A</span>
                            </div>
                            <div>
                                <h1 className="font-heading text-lg font-semibold text-text-primary tracking-tight leading-none">
                                    Axis Living
                                </h1>
                                <span className="text-[11px] text-text-secondary font-body tracking-wide uppercase">
                                    Client Portal
                                </span>
                            </div>
                        </Link>
                    )}
                    {collapsed && (
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <span className="text-white font-heading text-lg font-semibold">A</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className={`flex-1 py-6 ${collapsed ? 'px-3' : 'px-4'} space-y-1 overflow-y-auto`}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`
                  group relative flex items-center gap-3 rounded-xl
                  transition-all duration-200 ease-out
                  ${collapsed ? 'justify-center p-3' : 'px-4 py-3'}
                  ${isActive
                                        ? 'bg-primary text-white shadow-soft'
                                        : 'text-text-secondary hover:bg-accent/10 hover:text-text-primary'
                                    }
                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-primary rounded-xl"
                                        transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                                    />
                                )}
                                <Icon className={`relative z-10 w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                                {!collapsed && (
                                    <span className={`relative z-10 font-medium text-sm ${isActive ? 'text-white' : ''}`}>
                                        {item.label}
                                    </span>
                                )}
                                {collapsed && (
                                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-text-primary text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-elevated z-50">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Collapse toggle (desktop only) */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex items-center justify-center p-2 mx-4 mb-2 rounded-lg text-text-secondary hover:bg-accent/10 hover:text-text-primary transition-colors"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                    {!collapsed && <span className="text-xs font-medium ml-2">Collapse</span>}
                </button>

                {/* User Profile */}
                <div className={`border-t border-border ${collapsed ? 'p-3' : 'p-4'}`}>
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 bg-accent/30 border border-accent rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                                {client ? getInitials(client.name) : '?'}
                            </span>
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">
                                    {client?.name || 'Loading...'}
                                </p>
                                <p className="text-xs text-text-secondary truncate">
                                    {client?.email || ''}
                                </p>
                            </div>
                        )}
                        {!collapsed && (
                            <button
                                onClick={signOut}
                                className="p-2 rounded-lg text-text-secondary hover:bg-red-50 hover:text-error transition-colors"
                                aria-label="Sign out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>
        </>
    )
}

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, Users, FolderKanban, MessageSquare, Receipt, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudio } from '@/contexts/StudioContext'
import { cn, getInitials } from '@/lib/utils'

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/studio' },
    { label: 'Clients', icon: Users, href: '/studio/clients' },
    { label: 'Projects', icon: FolderKanban, href: '/studio/projects' },
    { label: 'Messages', icon: MessageSquare, href: '/studio/messages' },
    { label: 'Invoices', icon: Receipt, href: '/studio/invoices' },
]

export default function StudioTopBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const pathname = usePathname()
    const { signOut, studioUser } = useStudio()

    return (
        <>
            <header className="lg:hidden h-16 bg-[#111318] border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40">
                <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 text-white">
                    <Menu className="w-6 h-6" />
                </button>
                <Link href="/studio" className="absolute left-1/2 -translate-x-1/2">
                    <h1 className="font-heading text-[20px] font-semibold text-white leading-none">
                        Axis Studio
                    </h1>
                </Link>
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                    {getInitials(studioUser?.name)}
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-[#111318] z-[101] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-white/10">
                                <div>
                                    <h1 className="text-white font-heading text-xl font-semibold">Axis Living</h1>
                                    <div className="text-[#8b8fa3] text-[10px] font-bold tracking-[0.15em] uppercase">Studio Panel</div>
                                </div>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white/60 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/studio' && pathname.startsWith(item.href))
                                    const Icon = item.icon
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium transition-all",
                                                isActive ? "bg-white/10 text-white" : "text-[#8b8fa3] hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <Icon className={cn("w-6 h-6", isActive ? "text-blue-400" : "text-[#8b8fa3]")} />
                                            <span>{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </nav>

                            <div className="p-6 border-t border-white/10">
                                <button
                                    onClick={() => { setIsMenuOpen(false); signOut() }}
                                    className="w-full flex items-center justify-center gap-2 text-[#8b8fa3] text-sm font-semibold border border-white/10 rounded-xl py-3 hover:bg-white/5 hover:text-white transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

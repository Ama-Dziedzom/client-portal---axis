'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, MessageSquare } from 'lucide-react'
import { useDashboard } from '@/contexts/DashboardContext'
import MobileNav from '@/components/layout/MobileNav'

export default function TopBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { unreadCount } = useDashboard()

    return (
        <header className="lg:hidden h-16 bg-white border-b border-[#e5e0da] flex items-center justify-between px-6 sticky top-0 z-40">
            <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 -ml-2 text-[#2F402C]"
            >
                <Menu className="w-6 h-6" />
            </button>

            <Link href="/dashboard" className="absolute left-1/2 -translate-x-1/2">
                <h1 className="font-heading text-[22px] font-semibold text-[#2F402C] leading-none">
                    Axis Living
                </h1>
            </Link>

            <div className="relative">
                <Link href="/dashboard/messages" className="p-2 -mr-2 text-[#2F402C]">
                    <MessageSquare className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                            {unreadCount > 9 ? '!' : unreadCount}
                        </span>
                    )}
                </Link>
            </div>

            <MobileNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </header>
    )
}

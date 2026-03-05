'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useDashboard } from '@/contexts/DashboardContext'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const { loading } = useDashboard()

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f4f1] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-16 h-16 bg-[#2F402C] rounded-[24px] flex items-center justify-center shadow-lg">
                        <span className="text-white font-heading text-2xl font-bold">A</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Loader2 className="w-5 h-5 text-[#2F402C] animate-spin opacity-40" />
                        <p className="text-xs font-bold tracking-widest uppercase text-[#2F402C]/60">
                            Loading...
                        </p>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f7f4f1]">
            <Sidebar />
            <TopBar />

            <main className="lg:pl-[240px] flex-1">
                <div className="px-6 py-8 md:px-10 lg:px-12 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    )
}

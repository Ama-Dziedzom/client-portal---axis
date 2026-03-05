'use client'

import { useAuth } from '@/contexts/AuthContext'
import Sidebar from '@/components/layout/Sidebar'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const { loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
                        <span className="text-white font-heading text-xl font-semibold">A</span>
                    </div>
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <p className="text-sm text-text-secondary font-body">Loading your portal...</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar />
            <main className="flex-1 min-h-screen overflow-x-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    )
}

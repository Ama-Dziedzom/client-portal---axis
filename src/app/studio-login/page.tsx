'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import LoginForm from '@/components/auth/LoginForm'
import { studioSupabase } from '@/lib/supabase'

export default function StudioLoginPage() {
    return (
        <div className="flex min-h-screen bg-[#2F402C]">
            {/* Left panel - desktop only (45% width) */}
            <div className="hidden lg:relative lg:flex lg:w-[45%] lg:flex-col lg:items-center lg:justify-center overflow-hidden border-r border-white/10">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop"
                        alt="Studio background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-[#2F402C]/60" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center px-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-6"
                    >
                        <h1 className="text-white text-4xl font-heading tracking-[0.2em] font-light">STUDIO</h1>
                        <div className="h-px w-20 bg-[#C6B9AA] mx-auto mt-6" />
                    </motion.div>
                </div>
            </div>

            {/* Right panel (full width on mobile) */}
            <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-12 bg-white rounded-l-[40px] lg:rounded-l-[60px] shadow-2xl overflow-hidden">
                <LoginForm 
                    title="Studio Login"
                    subtitle="Management & Administrative Access"
                    redirectPath="/studio"
                    supabaseClient={studioSupabase}
                />
            </div>
        </div>
    )
}

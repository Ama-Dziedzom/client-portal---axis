'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen bg-background">
            {/* Left panel - desktop only (45% width) */}
            <div className="hidden lg:relative lg:flex lg:w-[45%] lg:flex-col lg:items-center lg:justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
                        alt="Interior design"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-6"
                    >
                        <h1 className="text-white text-5xl font-heading tracking-tight">AXIS</h1>
                        <div className="h-px w-12 bg-white/40 mx-auto mt-4" />
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-white/90 text-lg font-body italic"
                    >
                        Your project, your space, your portal.
                    </motion.p>
                </div>
            </div>

            {/* Right panel (full width on mobile) */}
            <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-12">
                <LoginForm 
                    title="Welcome back"
                    subtitle="Sign in to view your project"
                    redirectPath="/dashboard"
                />
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface LoginFormProps {
    title?: string
    subtitle?: string
    redirectPath: string
    contactEmail?: string
    supabaseClient: SupabaseClient
}

export default function LoginForm({
    title = 'Welcome back',
    subtitle = 'Sign in to your account',
    redirectPath,
    contactEmail = 'hello@axisliving.com',
    supabaseClient
}: LoginFormProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: authError } = await supabaseClient.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) {
                setError(authError.message)
                toast.error(authError.message)
                setLoading(false)
                return
            }

            toast.success('Welcome back!')
            
            // Artificial delay to allow toast to be seen and session to settle
            setTimeout(() => {
                window.location.href = redirectPath
            }, 100)
        } catch (err) {
            logger.error('Auth', 'Sign in error', err)
            setError('An unexpected error occurred')
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
        >
            <div className="mb-10 text-center lg:text-left">
                <h2 className="text-4xl font-semibold text-text-primary mb-3 font-heading">{title}</h2>
                <p className="text-text-secondary font-body text-lg">{subtitle}</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary font-body ml-1">
                        Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Mail className="h-4 w-4 text-text-secondary" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field pl-11 shadow-sm border-[#e5e0da]"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-text-primary font-body ml-1">
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Lock className="h-4 w-4 text-text-secondary" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field pl-11 pr-12 shadow-sm border-[#e5e0da]"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary hover:text-text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 text-base shadow-lg shadow-primary/10"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-error text-sm mt-4 text-center font-body bg-red-50 p-3 rounded-xl border border-red-100"
                    >
                        {error ?? 'An unknown error occurred'}
                    </motion.div>
                )}
            </form>

            <div className="mt-12 text-center">
                <p className="text-sm text-text-secondary font-body">
                    Having trouble?{' '}
                    <a href={`mailto:${contactEmail}`} className="text-primary font-semibold hover:underline">
                        Contact support.
                    </a>
                </p>
            </div>
        </motion.div>
    )
}

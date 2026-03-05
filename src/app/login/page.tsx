'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface LoginForm {
    email: string
    password: string
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectedFrom = searchParams.get('redirectedFrom')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>()

    const onSubmit = async (data: LoginForm) => {
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (error) throw error

            toast.success('Welcome back!')
            router.push(redirectedFrom || '/dashboard')
        } catch (error: any) {
            toast.error(error.message || 'Invalid credentials. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left panel — editorial image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary" />
                <div className="absolute inset-0 opacity-20">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                </div>
                <div className="relative z-10 flex flex-col justify-between p-16 text-white">
                    <div>
                        <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <span className="font-heading text-2xl font-semibold">A</span>
                        </div>
                    </div>
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="font-heading text-4xl lg:text-5xl font-light leading-tight mb-6"
                        >
                            Your space is
                            <br />
                            <span className="italic">taking shape.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-white/70 font-body text-lg max-w-md leading-relaxed"
                        >
                            Sign in to track your project&apos;s progress, review documents,
                            and stay connected with your design team.
                        </motion.p>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="text-white/40 text-sm font-body"
                    >
                        © {new Date().getFullYear()} Axis Living. All rights reserved.
                    </motion.p>
                </div>
            </div>

            {/* Right panel — login form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile brand */}
                    <div className="lg:hidden mb-12 text-center">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-heading text-2xl font-semibold">A</span>
                        </div>
                        <h1 className="font-heading text-2xl font-semibold text-text-primary">Axis Living</h1>
                        <p className="text-sm text-text-secondary mt-1">Client Portal</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="font-heading text-3xl font-semibold text-text-primary mb-2">
                            Welcome back
                        </h2>
                        <p className="text-text-secondary font-body">
                            Sign in to access your design projects
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2 font-body">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className={`input-field pl-11 ${errors.email ? 'border-error ring-error/20' : ''}`}
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Please enter a valid email',
                                        },
                                    })}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-error text-xs mt-1.5 font-body">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2 font-body">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className={`input-field pl-11 pr-11 ${errors.password ? 'border-error ring-error/20' : ''}`}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters',
                                        },
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-error text-xs mt-1.5 font-body">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3.5"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-text-secondary mt-8 font-body">
                        Need access?{' '}
                        <a href="mailto:hello@axisliving.com" className="text-primary font-medium hover:underline">
                            Contact your design team
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

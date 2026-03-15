'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Save, Sparkles, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function NewClientPage() {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }

        setSaving(true)
        try {
            const response = await fetch('/api/studio/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create client')
            }

            toast.success('Client account created successfully!')
            router.push(`/studio/clients/${result.userId}`)
            router.refresh()
        } catch (error: any) {
            console.error('Error creating client:', error)
            toast.error(error.message || 'Failed to create client')
            setSaving(false)
        }
    }

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+'
        const array = new Uint32Array(12)
        window.crypto.getRandomValues(array)
        let pass = ''
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(array[i] % chars.length)
        }
        setPassword(pass)
        setShowPassword(true)
        toast.success('Random password generated')
    }

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Breadcrumbs */}
            <motion.div variants={item} initial="hidden" animate="show" className="mb-8">
                <Link 
                    href="/studio/clients" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Clients
                </Link>
                <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">Add New Client</h1>
                <p className="text-text-secondary font-body text-lg">Create a private account for your client</p>
            </motion.div>

            <motion.form 
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-flat space-y-8"
            >
                <div className="space-y-6">
                    {/* Client Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-primary ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                            <input
                                type="text"
                                required
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field pl-11"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-primary ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                                <input
                                    type="email"
                                    required
                                    placeholder="client@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-primary ml-1">Phone Number (Optional)</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                                <input
                                    type="tel"
                                    placeholder="+260 97..."
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="input-field pl-11"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-semibold text-text-primary">Initial Password</label>
                            <button 
                                type="button" 
                                onClick={generatePassword}
                                className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
                            >
                                Generate Random
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={8}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-11 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-text-secondary px-1">
                            Provide this password to the client for their first login. They can change it in their settings.
                        </p>
                    </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary flex-1 py-4 shadow-lg shadow-primary/10"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Create Client Account
                            </>
                        )}
                    </button>
                    <Link
                        href="/studio/clients"
                        className="btn-secondary flex-1 py-4"
                    >
                        Cancel
                    </Link>
                </div>
            </motion.form>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex items-center justify-center gap-2 p-6 rounded-2xl bg-primary/5 text-primary/60 border border-primary/10"
            >
                <Sparkles className="w-4 h-4" />
                <p className="text-xs font-medium">Once created, you can assign this client to new or existing projects.</p>
            </motion.div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStudio } from '@/contexts/StudioContext'
import { studioSupabase as supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { User, Mail, Shield, Lock, LogOut, Loader2, Palette, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileForm {
    name: string
}

interface PasswordForm {
    newPassword: string
    confirmPassword: string
}

export default function StudioSettingsPage() {
    const { studioUser, signOut } = useStudio()
    const [updatingProfile, setUpdatingProfile] = useState(false)
    const [updatingPassword, setUpdatingPassword] = useState(false)

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
    } = useForm<ProfileForm>({
        defaultValues: {
            name: studioUser?.name || '',
        },
    })

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        reset: resetPassword,
        watch,
    } = useForm<PasswordForm>()

    const newPassword = watch('newPassword')

    const onProfileSubmit = async (data: ProfileForm) => {
        if (!studioUser) return
        setUpdatingProfile(true)
        try {
            const { error } = await supabase
                .from('studio_users')
                .update({ name: data.name })
                .eq('id', studioUser.id)

            if (error) throw error
            toast.success('Studio profile updated')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update studio profile')
        } finally {
            setUpdatingProfile(false)
        }
    }

    const onPasswordSubmit = async (data: PasswordForm) => {
        setUpdatingPassword(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.newPassword,
            })

            if (error) throw error
            toast.success('Password updated')
            resetPassword()
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password')
        } finally {
            setUpdatingPassword(false)
        }
    }

    return (
        <div className="max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">
                        Studio Settings
                    </h1>
                    <p className="text-text-secondary font-body text-lg">
                        Manage your team profile and portal preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Tabs (UI only for now) */}
                    <div className="lg:col-span-1 space-y-1">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary/5 text-primary rounded-xl text-sm font-semibold transition-all">
                            <User className="w-4 h-4" /> Account
                        </button>
                        <button disabled className="w-full flex items-center gap-3 px-4 py-3 text-text-secondary hover:bg-accent/5 rounded-xl text-sm font-medium transition-all cursor-not-allowed opacity-50">
                            <Bell className="w-4 h-4" /> Notifications
                        </button>
                        <button disabled className="w-full flex items-center gap-3 px-4 py-3 text-text-secondary hover:bg-accent/5 rounded-xl text-sm font-medium transition-all cursor-not-allowed opacity-50">
                            <Palette className="w-4 h-4" /> Appearance
                        </button>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Section */}
                        <section className="card-flat">
                            <h2 className="text-lg font-heading font-semibold text-text-primary mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" /> Profile Details
                            </h2>
                            
                            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-text-primary ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        className={`input-field ${profileErrors.name ? 'border-error' : ''}`}
                                        {...registerProfile('name', { required: 'Name is required' })}
                                    />
                                    {profileErrors.name && (
                                        <p className="text-error text-xs mt-1">{profileErrors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-text-primary ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                                        <input
                                            type="email"
                                            value={studioUser?.email || ''}
                                            disabled
                                            className="input-field pl-11 bg-accent/5 cursor-not-allowed opacity-70"
                                        />
                                    </div>
                                    <p className="text-[10px] text-text-secondary ml-1 italic">
                                        Email management is handled via the admin dashboard.
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={updatingProfile} 
                                        className="btn-primary min-w-[140px]"
                                    >
                                        {updatingProfile ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Security Section */}
                        <section className="card-flat">
                            <h2 className="text-lg font-heading font-semibold text-text-primary mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" /> Security
                            </h2>

                            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-text-primary ml-1">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                                        <input
                                            type="password"
                                            placeholder="Min 8 characters"
                                            className={`input-field pl-11 ${passwordErrors.newPassword ? 'border-error' : ''}`}
                                            {...registerPassword('newPassword', {
                                                required: 'New password is required',
                                                minLength: {
                                                    value: 8,
                                                    message: 'Password must be at least 8 characters',
                                                },
                                            })}
                                        />
                                    </div>
                                    {passwordErrors.newPassword && (
                                        <p className="text-error text-xs mt-1">{passwordErrors.newPassword.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-text-primary ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                                        <input
                                            type="password"
                                            placeholder="Repeat new password"
                                            className={`input-field pl-11 ${passwordErrors.confirmPassword ? 'border-error' : ''}`}
                                            {...registerPassword('confirmPassword', {
                                                required: 'Please confirm your password',
                                                validate: (value) => value === newPassword || 'Passwords do not match',
                                            })}
                                        />
                                    </div>
                                    {passwordErrors.confirmPassword && (
                                        <p className="text-error text-xs mt-1">{passwordErrors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={updatingPassword} 
                                        className="btn-secondary min-w-[140px]"
                                    >
                                        {updatingPassword ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Update Password'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Session Section */}
                        <section className="card-flat border-red-100 bg-red-50/10">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">Session Management</h3>
                                    <p className="text-xs text-text-secondary mt-1">
                                        End your current session across all devices
                                    </p>
                                </div>
                                <button 
                                    onClick={signOut}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-error border border-red-200 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors shadow-sm"
                                >
                                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

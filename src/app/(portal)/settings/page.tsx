'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { User, Mail, Phone, Lock, LogOut, Loader2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileForm {
    name: string
    phone: string
}

interface PasswordForm {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export default function SettingsPage() {
    const { client, signOut } = useAuth()
    const [updatingProfile, setUpdatingProfile] = useState(false)
    const [updatingPassword, setUpdatingPassword] = useState(false)

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
    } = useForm<ProfileForm>({
        defaultValues: {
            name: client?.name || '',
            phone: client?.phone || '',
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
        if (!client) return
        setUpdatingProfile(true)
        try {
            const { error } = await supabase
                .from('clients')
                .update({ name: data.name, phone: data.phone })
                .eq('id', client.id)

            if (error) throw error
            toast.success('Profile updated')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setUpdatingProfile(false)
        }
    }

    const onPasswordSubmit = async (data: PasswordForm) => {
        if (!client) return
        setUpdatingPassword(true)
        try {
            // 1. Re-authenticate to verify current password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: client.email,
                password: data.currentPassword,
            })

            if (signInError) {
                throw new Error('Current password is incorrect')
            }

            // 2. Clear re-auth session (optional, but cleaner)
            // Note: In some Supabase setups, this might sign the user out if not careful.
            // However, updateUser() requires an active session.

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
        <div className="page-container">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl lg:text-4xl font-heading font-semibold text-text-primary mb-2">
                        Settings
                    </h1>
                    <p className="text-text-secondary font-body text-lg">
                        Manage your account preferences
                    </p>
                </div>

                <div className="max-w-2xl space-y-8">
                    {/* Profile */}
                    <div className="card-flat">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-heading text-lg font-semibold text-text-primary">Profile Information</h2>
                                <p className="text-xs text-text-secondary">Update your personal details</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
                                <input
                                    type="text"
                                    className={`input-field ${profileErrors.name ? 'border-error' : ''}`}
                                    {...registerProfile('name', { required: 'Name is required' })}
                                />
                                {profileErrors.name && (
                                    <p className="text-error text-xs mt-1">{profileErrors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                    <input
                                        type="email"
                                        value={client?.email || ''}
                                        disabled
                                        className="input-field pl-11 bg-accent/5 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-text-secondary mt-1">
                                    Contact your design team to change your email address.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                    <input
                                        type="tel"
                                        placeholder="+260 97 XXX XXXX"
                                        className="input-field pl-11"
                                        {...registerProfile('phone')}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={updatingProfile} className="btn-primary">
                                    {updatingProfile ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Password */}
                    <div className="card-flat">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-heading text-lg font-semibold text-text-primary">Change Password</h2>
                                <p className="text-xs text-text-secondary">Update your account password</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                    <input
                                        type="password"
                                        placeholder="Enter current password"
                                        className={`input-field pl-11 ${passwordErrors.currentPassword ? 'border-error' : ''}`}
                                        {...registerPassword('currentPassword', {
                                            required: 'Current password is required',
                                        })}
                                    />
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="text-error text-xs mt-1">{passwordErrors.currentPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                    <input
                                        type="password"
                                        placeholder="Enter new password"
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

                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
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
                                <button type="submit" disabled={updatingPassword} className="btn-primary">
                                    {updatingPassword ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Update Password'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="card-flat border-red-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-error" />
                            </div>
                            <div>
                                <h2 className="font-heading text-lg font-semibold text-text-primary">Sign Out</h2>
                                <p className="text-xs text-text-secondary">Sign out of your portal account</p>
                            </div>
                        </div>
                        <button onClick={signOut} className="px-5 py-2.5 bg-red-50 text-error font-semibold text-sm rounded-xl border border-red-200 hover:bg-red-100 transition-colors">
                            Sign Out
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

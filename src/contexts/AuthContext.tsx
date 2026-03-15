'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Client } from '@/types/database'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface AuthContextType {
    session: Session | null
    user: User | null
    client: Client | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    client: null,
    loading: true,
    signOut: async () => { },
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const { session, user: client, loading, signOut } = useSupabaseAuth<Client>(
        'clients',
        '/login',
        async () => {
            // Not a client, sign out and redirect to login
            logger.warn('Auth', 'User not found in clients table, signing out')
            await supabase.auth.signOut()
            router.push('/login')
        }
    )

    return (
        <AuthContext.Provider
            value={{
                session,
                user: session?.user ?? null,
                client,
                loading,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

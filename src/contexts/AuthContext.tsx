'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Client } from '@/types/database'
import { clientSupabase } from '@/lib/supabase'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
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
        clientSupabase,
        'clients',
        '/login',
        async () => {
            // Not a client, just let the middleware handle redirection if needed
            // We DON'T sign out here because the user might be a studio user
            logger.warn('Auth', 'User not found in clients table')
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

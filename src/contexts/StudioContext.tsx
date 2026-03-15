'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { StudioUser } from '@/types/database'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { studioSupabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface StudioContextType {
    session: Session | null
    studioUser: StudioUser | null
    loading: boolean
    signOut: () => Promise<void>
}

const StudioContext = createContext<StudioContextType>({
    session: null,
    studioUser: null,
    loading: true,
    signOut: async () => { },
})

export function StudioProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const { session, user: studioUser, loading, signOut } = useSupabaseAuth<StudioUser>(
        studioSupabase,
        'studio_users',
        '/studio-login',
        async () => {
            // Not a studio user, just let the middleware handle redirection if needed
            logger.warn('Auth', 'User not found in studio_users table')
        }
    )

    return (
        <StudioContext.Provider
            value={{
                session,
                studioUser,
                loading,
                signOut,
            }}
        >
            {children}
        </StudioContext.Provider>
    )
}

export const useStudio = () => {
    const context = useContext(StudioContext)
    if (!context) {
        throw new Error('useStudio must be used within a StudioProvider')
    }
    return context
}

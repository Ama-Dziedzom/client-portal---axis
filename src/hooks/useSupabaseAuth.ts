'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Session, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

/**
 * Shared hook for managing Supabase authentication state and user data fetching.
 * Used by AuthContext and StudioContext to reduce duplication.
 */
export function useSupabaseAuth<TUserData>(
    supabase: SupabaseClient,
    tableName: 'clients' | 'studio_users',
    redirectOnSignOut: string,
    onNotFound?: () => void
) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<TUserData | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        let mounted = true;

        logger.info('Auth', `Initializing useSupabaseAuth for ${tableName}`)

        const timer = setTimeout(() => {
            if (loading && mounted) {
                logger.warn('Auth', `Auth initialization timeout reached for ${tableName}`)
                setLoading(false)
            }
        }, 8000)

        // Initial session check - faster than waiting for event
        const initAuth = async () => {
            try {
                // Use getUser() for verified data and to silence warnings
                const { data: { user }, error } = await supabase.auth.getUser()
                if (!mounted) return

                if (user) {
                    logger.info('Auth', `Initial user found for ${tableName}`, { userId: user.id })
                    // We still need the session for some components, get it from getSession (cached)
                    const { data: { session } } = await supabase.auth.getSession()
                    setSession(session)
                    await fetchUserData(user.id)
                } else {
                    logger.info('Auth', `No initial session found for ${tableName}`)
                    setSession(null)
                    setUser(null)
                    setLoading(false)
                }
            } catch (error) {
                logger.error('Auth', 'Error checking initial session', error)
                if (mounted) setLoading(false)
            }
        }

        initAuth()

        // Listen for subsequent auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                if (!mounted) return
                
                logger.info('Auth', `Auth event: ${event}`, { userId: currentSession?.user?.id })
                
                // If the event is SIGNED_OUT, handle it promptly
                if (event === 'SIGNED_OUT') {
                    setSession(null)
                    setUser(null)
                    setLoading(false)
                    return
                }

                // If we have a session, ensure we have the user data
                if (currentSession?.user) {
                    setSession(currentSession)
                    fetchUserData(currentSession.user.id)
                } else {
                    setSession(null)
                    setUser(null)
                    setLoading(false)
                }
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
            clearTimeout(timer)
        }
    }, [tableName, supabase]) // Re-run if tableName or client instance changes

    const fetchUserData = async (userId: string) => {
        if (!userId) return;
        
        try {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                logger.error('Auth', `DB Error fetching ${tableName}`, error)
                // Don't clear user on error, might be transient
            } else {
                if (!data && onNotFound) {
                    logger.warn('Auth', `User ${userId} not found in ${tableName}`)
                    onNotFound()
                }
                setUser(data)
            }
        } catch (error) {
            logger.error('Auth', `Unexpected error fetching ${tableName}`, error)
        } finally {
            setLoading(false)
        }
    }

    const signOut = async () => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            
            setSession(null)
            setUser(null)
            router.push(redirectOnSignOut)
            router.refresh()
        } catch (error) {
            logger.error('Auth', 'Sign out error', error)
            // Even if signOut fails, we should probably clear local state
            setSession(null)
            setUser(null)
            router.push(redirectOnSignOut)
        } finally {
            setLoading(false)
        }
    }

    return {
        session,
        user,
        loading,
        signOut,
        refreshUser: () => session?.user && fetchUserData(session.user.id)
    }
}

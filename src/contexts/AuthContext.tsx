'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'
import { Client } from '@/types/database'

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
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [client, setClient] = useState<Client | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchClient(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                if (session?.user) {
                    await fetchClient(session.user.id)
                } else {
                    setClient(null)
                    setLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const fetchClient = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            setClient(data)
        } catch (error) {
            console.error('Error fetching client:', error)
        } finally {
            setLoading(false)
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
        setClient(null)
    }

    return (
        <AuthContext.Provider value={{ session, user, client, loading, signOut }}>
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

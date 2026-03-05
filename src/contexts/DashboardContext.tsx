'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { Project, Client } from '@/types/database'
import { useRouter } from 'next/navigation'

interface DashboardContextType {
    project: Project | null
    client: Client | null
    unreadCount: number
    loading: boolean
}

const DashboardContext = createContext<DashboardContextType>({
    project: null,
    client: null,
    unreadCount: 0,
    loading: true,
})

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { session, client: authClient, loading: authLoading } = useAuth()
    const [project, setProject] = useState<Project | null>(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (authLoading) return

        if (!session) {
            setLoading(false)
            router.push('/login')
            return
        }

        async function fetchDashboardData() {
            setLoading(true) // Ensure loading is true when starting
            try {
                const userId = session?.user.id
                if (!userId) throw new Error('No user ID found in session')

                // Fetch project
                const { data: projectData, error: projectError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('client_id', userId)
                    .single()

                if (projectError && projectError.code !== 'PGRST116') {
                    console.error('Error fetching project:', projectError.message)
                }

                if (projectData) {
                    setProject(projectData)

                    // Fetch unread messages count
                    const { count, error: countError } = await supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('project_id', projectData.id)
                        .eq('sender_type', 'studio')
                        .eq('read', false)

                    if (!countError) {
                        setUnreadCount(count || 0)
                    } else {
                        console.error('[DashboardContext] Count Error:', countError.message)
                    }
                } else {
                    setProject(null)
                    setUnreadCount(0)
                }
            } catch (error) {
                console.error('Dashboard data fetch error:', error)
            } finally {
                setLoading(false)
            }
        }

        console.log('[DashboardContext] Fetching started...')
        fetchDashboardData()
    }, [session, authLoading, router])

    return (
        <DashboardContext.Provider value={{
            project,
            client: authClient,
            unreadCount,
            loading: loading || authLoading
        }}>
            {children}
        </DashboardContext.Provider>
    )
}

export const useDashboard = () => useContext(DashboardContext)

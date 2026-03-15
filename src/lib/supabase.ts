import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { publicEnv } from '@/lib/env'

export const clientSupabase = createBrowserClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
        cookieOptions: {
            name: 'sb-axis-client-token',
        }
    }
)

export const studioSupabase = createBrowserClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
        cookieOptions: {
            name: 'sb-axis-studio-token',
        }
    }
)

// Default export for client portal compatibility
export const supabase = clientSupabase


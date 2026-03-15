import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { publicEnv } from '@/lib/env'

export const supabase = createBrowserClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey
)

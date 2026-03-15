import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { publicEnv, serverEnv } from '@/lib/env'

let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin() {
    if (!_supabaseAdmin) {
        _supabaseAdmin = createClient(
            publicEnv.supabaseUrl,
            serverEnv.supabaseServiceRoleKey()
        )
    }
    return _supabaseAdmin
}

// For backwards compatibility
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        return (getSupabaseAdmin() as any)[prop]
    },
})

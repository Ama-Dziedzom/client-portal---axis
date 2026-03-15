// Centralized environment variable validation
// Fails loudly at startup if required vars are missing

function getEnv(key: string, required = true): string {
    const value = process.env[key]
    if (!value && required) {
        throw new Error(
            `❌ Missing required environment variable: ${key}\n` +
            `   Add it to your .env.local file.`
        )
    }
    return value ?? ''
}

function getPublicEnv(key: string): string {
    const value = process.env[key]
    if (!value) {
        throw new Error(
            `❌ Missing required public environment variable: ${key}\n` +
            `   Add it to your .env.local file.`
        )
    }
    return value
}

// Server-only env vars (never exposed to browser)
export const serverEnv = {
    supabaseServiceRoleKey: () => getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    resendApiKey: () => getEnv('RESEND_API_KEY', false),
    resendFromName: () => process.env.RESEND_FROM_NAME ?? 'Axis Living',
    resendFromEmail: () => getEnv('RESEND_FROM_EMAIL', false),
    paystackSecretKey: () => getEnv('PAYSTACK_SECRET_KEY', false),
    portalUrl: () => process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://portal.axisliving.com',
} as const

// Public env vars (safe for browser)
// IMPORTANT: Static indexing (process.env.NEXT_PUBLIC_...) is required for Next.js to bundle these for the client.
export const publicEnv = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
} as const

// Validation check (runs on server and client)
if (typeof window === 'undefined') {
    if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
        throw new Error('❌ Missing required Supabase environment variables! Check your .env.local')
    }
}

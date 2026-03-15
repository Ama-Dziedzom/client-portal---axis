// Structured logging utility — replaces raw console.log/warn/error
// In production, only warnings and errors are logged.

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
    /** Debug/info — only in development */
    info: (context: string, message: string, data?: unknown) => {
        if (isDev) {
            console.log(`[${context}] ${message}`, data !== undefined ? data : '')
        }
    },

    /** Warnings — always logged */
    warn: (context: string, message: string, data?: unknown) => {
        console.warn(`[${context}] ${message}`, data !== undefined ? data : '')
    },

    /** Errors — always logged. In production, consider sending to Sentry/etc. */
    error: (context: string, message: string, error?: unknown) => {
        console.error(`[${context}] ${message}`, error !== undefined ? error : '')
        // TODO: In production, send to error tracking service
        // e.g. Sentry.captureException(error)
    },
} as const

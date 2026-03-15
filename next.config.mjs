/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    reactStrictMode: false, // Helps prevent double-initialization of Supabase in dev
    devIndicators: {
        buildActivity: true,
        buildActivityPosition: 'bottom-right',
    },
    // Security headers
    async headers() {
        if (process.env.NODE_ENV === 'development') return [];
        
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co; style-src 'self' 'unsafe-inline' https://fonts.cdnfonts.com; font-src 'self' https://fonts.cdnfonts.com; img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co; connect-src 'self' https://*.supabase.co https://api.paystack.co-proxy.supabase.co https://api.paystack.co;",
                    },
                ],
            },
        ]
    },
};

export default nextConfig;

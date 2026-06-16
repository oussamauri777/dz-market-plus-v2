import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https' as const,
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https' as const,
                hostname: 'placehold.co',
                pathname: '/**',
            },
            {
                protocol: 'https' as const,
                hostname: 'dummyimage.com',
                pathname: '/**',
            },
            {
                protocol: 'https' as const,
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https' as const,
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
        ],
    },
};

export default withNextIntl(nextConfig);

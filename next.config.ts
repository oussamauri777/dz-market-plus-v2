import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
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
        ],
    },
};

export default withNextIntl(nextConfig);

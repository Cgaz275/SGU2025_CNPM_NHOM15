/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.builder.io',
            },
            {
                protocol: 'https',
                hostname: 'i.ibb.co',
            },
            {
                protocol: 'https',
                hostname: '**.imgbb.com',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
            {
                protocol: 'https',
                hostname: '**.firebaseapp.com',
            },
            {
                protocol: 'https',
                hostname: '**.firebasestorage.googleapis.com',
            },
        ],
    },
};

export default nextConfig;

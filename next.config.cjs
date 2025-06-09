/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: true,
    },
    // Ensure we're using the correct directory structure
    distDir: '.next',
    // Configure the server
    server: {
        port: process.env.PORT || 3000,
    }
};

module.exports = nextConfig; 
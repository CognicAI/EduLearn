/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com']
  },
  // Allow cross-origin dev requests from this origin for /_next resources
  allowedDevOrigins: [
    'http://192.168.0.5:3000',
    'http://192.168.0.5',
    'http://localhost:3000'
  ],
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com']
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.5:3001/api',
    NEXT_PUBLIC_CHATBOT_WEBHOOK_URL: process.env.NEXT_PUBLIC_CHATBOT_WEBHOOK_URL,
  },
  // Allow cross-origin dev requests from this origin for /_next resources
  allowedDevOrigins: [
    'http://192.168.0.5:3000',
    'http://192.168.0.5',
    'http://localhost:3000'
  ],
};

module.exports = nextConfig;
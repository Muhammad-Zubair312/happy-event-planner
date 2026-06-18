import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly bundle NEXT_PUBLIC_ vars at build time — fixes Android wa.me links
  env: {
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 180, 256, 384],
    minimumCacheTTL: 2592000,
  },
};

export default nextConfig;
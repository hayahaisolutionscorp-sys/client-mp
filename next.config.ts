import type { NextConfig } from "next";

const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public', // destination directory for the PWA files
  disable: process.env.NODE_ENV === 'development', // disable PWA in development
  register: true, // register the PWA service worker
  skipWaiting: true, // skip waiting for service worker activation
  runtimeCaching: [
    // ─── NEVER cache API/auth calls ─────────────────────────────────────────────
    // Auth and API calls must NEVER be served from cache.
    // Path-based pattern ensures auth requests are excluded regardless of origin,
    // which avoids issues when build-time env vars don't match the production domain.
    {
      urlPattern: /\/auth\//,
      handler: 'NetworkOnly',
    },
    // Also exclude by origin when the env vars are available at build time
    ...(process.env.NEXT_PUBLIC_API_URL
      ? [{
          urlPattern: new RegExp(`^${process.env.NEXT_PUBLIC_API_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*`),
          handler: 'NetworkOnly' as const,
        }]
      : []),
    ...(process.env.NEXT_PUBLIC_API_BASE_URL
      ? [{
          urlPattern: new RegExp(`^${process.env.NEXT_PUBLIC_API_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*`),
          handler: 'NetworkOnly' as const,
        }]
      : []),
    // Also exclude Next.js internal API routes from caching
    {
      urlPattern: /\/api\//,
      handler: 'NetworkOnly',
    },
    // ─── NEVER cache large media files ──────────────────────────────────────────
    // Video files are too large for the Cache API and cause
    // ERR_CACHE_OPERATION_NOT_SUPPORTED when the service worker tries to store them.
    {
      urlPattern: /\.(?:mp4|webm|ogg|avi|mov)(?:\?.*)?$/i,
      handler: 'NetworkOnly',
    },
    // S3 asset bucket — images are fine to cache but videos above will match first
    {
      urlPattern: /^https:\/\/ayahay-assets\.s3\.ap-southeast-2\.amazonaws\.com\/.*/,
      handler: 'NetworkOnly',
    },
    // ─── Static assets / pages: NetworkFirst ────────────────────────────────────
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
  // Exclude payment routes from service worker to avoid caching issues
  publicExcludes: ['!payment-*'],
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', '@radix-ui/react-icons'],
  },
  // For development purposes only
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'ayahay-assets.s3.ap-southeast-2.amazonaws.com',
  //       port: '',
  //       pathname: '/**',
  //     },
  //   ],
  //
  // },
  // output: "standalone", 
  // Add this for now para ma build ang project remove when good to go
  eslint: {
    ignoreDuringBuilds: true
  },
};

export default withPWA(nextConfig);
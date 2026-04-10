import type { NextConfig } from "next";

const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public', // destination directory for the PWA files
  disable: process.env.NODE_ENV === 'development', // disable PWA in development
  register: true, // register the PWA service worker
  skipWaiting: true, // skip waiting for service worker activation
  runtimeCaching: [
    // ─── NEVER cache API/auth calls ─────────────────────────────────────────────
    // The client API backend (auth/me, bookings, etc.) must NEVER be served from
    // cache – stale auth responses were causing an infinite auth/me loop in prod.
    {
      urlPattern: /^https:\/\/client\.hayahai\.com\/.*/,
      handler: 'NetworkOnly',
    },
    // Also exclude Next.js internal API routes from caching
    {
      urlPattern: /\/api\//,
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
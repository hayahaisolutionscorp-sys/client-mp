import type { NextConfig } from "next";
// @ts-expect-error -- `next-pwa` does not currently ship typed config helpers.
import withPWAInit from 'next-pwa';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const apiOrigins = Array.from(
  new Set(
    [
      process.env.NEXT_PUBLIC_API_URL,
      process.env.NEXT_PUBLIC_API_BASE_URL,
      process.env.NEXT_PUBLIC_CORE_API_URL,
    ]
      .filter(Boolean)
      .map((url) => String(url).replace(/\/+$/, ''))
  )
);

const networkOnlyApiRoutes = [
  ...apiOrigins.map((origin) => ({
    urlPattern: new RegExp(`^${escapeRegex(origin)}/.*`),
    handler: 'NetworkOnly',
  })),
  // Never cache Next.js route handlers or proxy APIs.
  {
    urlPattern: /^https?:\/\/[^/]+\/api\/.*$/,
    handler: 'NetworkOnly',
  },
  // Never cache authenticated / mutable backend traffic, regardless of which
  // Hayahai API origin is active in the deployment.
  {
    urlPattern: /^https?:\/\/[^/]+\/(?:auth|accounts|bookings|profiles|verification|notifications|passengers|payments|pay|upload|disbursement|email|seat-plans)(?:\/.*)?$/,
    handler: 'NetworkOnly',
  },
];

const withPWA = withPWAInit({
  dest: 'public', // destination directory for the PWA files
  disable: process.env.NODE_ENV === 'development', // disable PWA in development
  register: true, // register the PWA service worker
  skipWaiting: true, // skip waiting for service worker activation
  runtimeCaching: [
    // ─── NEVER cache API/auth calls ─────────────────────────────────────────────
    // Stale cached auth responses can create repeated /auth/me loops in prod,
    // so all authenticated and mutable API traffic stays strictly network-only.
    ...networkOnlyApiRoutes,
    // ─── NEVER cache large media files ──────────────────────────────────────────
    // Video files are too large for the Cache API and can fail when the service
    // worker tries to persist them during offline caching.
    {
      urlPattern: /\.(?:mp4|webm|ogg|avi|mov)(?:\?.*)?$/i,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /^https:\/\/ayahay-assets\.s3\.ap-southeast-2\.amazonaws\.com\/.*/,
      handler: 'NetworkOnly',
    },
    // Raster / vector logos and UI images: never serve from SW cache. The catch-all
    // NetworkFirst + timeout can otherwise return a stale failed response so the navbar
    // logo appears missing until cache expires or the network wins.
    {
      urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|ico)(?:\?[^#]*)?(?:#.*)?$/i,
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
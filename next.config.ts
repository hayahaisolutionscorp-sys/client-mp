import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public', // destination directory for the PWA files
  // disable: process.env.NODE_ENV === 'development', // disable PWA in development
  disable: false,
  register: true, // register the PWA service worker
  skipWaiting: true, // skip waiting for service worker activation
});

const nextConfig: NextConfig = {
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
  }
};

export default withPWA(nextConfig);
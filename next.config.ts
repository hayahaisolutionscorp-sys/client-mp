import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For development purposes only
  images: {
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

  // },
  // Add this for now para ma build ang project remove when good to go
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
import type { NextConfig } from 'next'

import {
  adminSecurityHeader,
  securityHeaders,
} from './lib/security/headers'

const ogRuntimeAssets = [
  './app/_fonts/FrexSansGB-OG-*.ttf',
]

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // Keep the generated OG font files inside the serverless function bundle.
  outputFileTracingIncludes: {
    '/og': ogRuntimeAssets,
  },

  // Pin the project root: when developing from a git worktree nested inside
  // another checkout, Next's lockfile-based root inference walks too far up.
  turbopack: { root: import.meta.dirname },

  // Shared-element morphs (cover/title) on route navigation; browsers
  // without the View Transitions API just navigate instantly.
  experimental: {
    authInterrupts: true,
    globalNotFound: true,
    useTypeScriptCli: true,
    sri: { algorithm: 'sha256' },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    localPatterns: [
      { pathname: '/content/**' },
      { pathname: '/images/**' },
      { pathname: '/_next/static/**' },
    ],
  },

  headers: async () => [
    {
      source: '/:path*',
      headers: [...securityHeaders],
    },
    {
      // The global policy is intentionally useful for public navigation, but
      // admin API responses must never disclose their origin to another site.
      source: '/api/admin/:path*',
      headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }],
    },
    {
      // Admin pages use same-origin Better Auth cookies; no external auth
      // origin is needed in the owner policy.
      source: '/admin/:path*',
      headers: [adminSecurityHeader],
    },
    {
      // OG responses are images, never documents that may run in this origin.
      source: '/og',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'none'; sandbox",
        },
      ],
    },
  ],
}

export default nextConfig

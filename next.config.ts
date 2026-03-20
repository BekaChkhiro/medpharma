import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Check if running in Specta Studio (development preview)
const isSpectaStudio = process.env.SPECTA_STUDIO === 'true' || process.env.NODE_ENV === 'development';

// Security headers configuration
const securityHeaders = [
  // Strict Transport Security - enforce HTTPS
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // Prevent clickjacking attacks (disabled in development for Specta Studio preview)
  ...(isSpectaStudio ? [] : [{
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  }]),
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // XSS protection (legacy, but still useful for older browsers)
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // DNS prefetch control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // Permissions Policy (formerly Feature-Policy)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' https: blob:",
      "connect-src 'self' https://api.tbcbank.ge https://ipay.ge https://www.google-analytics.com https://api.planflow.tools",
      "frame-src 'self' https://api.tbcbank.ge https://ipay.ge https://www.google.com",
      isSpectaStudio ? "frame-ancestors *" : "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // External packages that should not be bundled (server-side only)
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  // Image optimization configuration
  images: {
    // Enable image optimization
    unoptimized: false,

    // Supported image formats (WebP and AVIF for modern browsers)
    formats: ['image/avif', 'image/webp'],

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Image sizes for next/image component
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Minimum cache TTL (1 year)
    minimumCacheTTL: 31536000,

    // Remote image patterns (S3, CDN, etc.)
    remotePatterns: [
      // AWS S3
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      // DigitalOcean Spaces
      {
        protocol: 'https',
        hostname: '*.digitaloceanspaces.com',
        pathname: '/**',
      },
      // Cloudflare R2
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        pathname: '/**',
      },
      // Generic CDN pattern (configure as needed)
      {
        protocol: 'https',
        hostname: 'cdn.medpharma.ge',
        pathname: '/**',
      },
      // Local development (MinIO)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      // Placeholder images (for development)
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      // Unsplash (for demo/placeholder content)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Pexels (for demo/placeholder content)
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      // Picsum (for demo/placeholder content)
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      // Lorem Picsum (fastly CDN)
      {
        protocol: 'https',
        hostname: '*.picsum.photos',
        pathname: '/**',
      },
    ],
  },

  // Turbopack configuration (for dev mode)
  turbopack: {
    root: process.cwd(),
  },

  // Webpack configuration (for production builds)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize Prisma for server builds
      config.externals = [...(config.externals || []), '@prisma/client'];
    }
    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Additional cache headers for static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache headers for images
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache headers for fonts
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects configuration
  async redirects() {
    return [
      // Redirect www to non-www (configure based on preference)
      // {
      //   source: '/:path*',
      //   has: [{ type: 'host', value: 'www.medpharma.ge' }],
      //   destination: 'https://medpharma.ge/:path*',
      //   permanent: true,
      // },
    ];
  },

  // Rewrites for API proxy (if needed)
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // Experimental features
  experimental: {
    // Enable server actions (stable in Next.js 14+)
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize package imports for better tree-shaking
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-icons',
      'date-fns',
    ],
  },

  // Compression (handled by Railway/hosting platform)
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // Powered by header (disable for security)
  poweredByHeader: false,

  // React strict mode for development
  reactStrictMode: true,

  // Output configuration for deployment
  output: 'standalone',

  // Environment variables that should be available on the client
  env: {
    // App version for cache busting
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
  },
};

export default withNextIntl(nextConfig);

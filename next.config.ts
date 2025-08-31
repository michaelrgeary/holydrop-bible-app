import type { NextConfig } from "next";

// Bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// @ts-ignore - next-pwa types may not be fully compatible
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^\/data\/bible\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'bible-chapters',
        expiration: {
          maxEntries: 1200,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year (Bible text doesn't change)
        }
      }
    },
    {
      urlPattern: /^\/api\/annotations\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'annotations',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.(gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
        }
      }
    },
    {
      urlPattern: /\/_next\/static.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    }
  ]
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Temporarily disable ESLint during build for production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'holydrop.vercel.app',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Production-only optimizations
    if (!dev && !isServer) {
      // Bundle splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          minSize: 20000,
          maxSize: 250000,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            default: false,
            vendors: false,
            // Bible data chunk
            bible: {
              name: 'bible-data',
              test: /[\\/]data[\\/]bible[\\/]/,
              chunks: 'all',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Search engine chunk
            search: {
              name: 'search-engine',
              test: /[\\/]lib[\\/]search[\\/]/,
              chunks: 'all',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Sharing components chunk
            sharing: {
              name: 'sharing',
              test: /[\\/]components[\\/]sharing[\\/]/,
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Vendor chunk for large libraries
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
      
      // Tree shaking improvements
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    return config;
  },
  
  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
};

export default withBundleAnalyzer(withPWA(nextConfig));
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable static exports for better performance
  output: 'standalone',
  
  // Optimize caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=31536000',
          },
        ],
      },
    ];
  },

  // Control route generation
  async rewrites() {
    return {
      beforeFiles: [
        // API routes
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
        // Main application route
        {
          source: '/',
          destination: '/',
        },
        // Add other necessary routes here
        {
          source: '/exchange',
          destination: '/exchange',
        },
        {
          source: '/hotel',
          destination: '/hotel',
        },
      ],
    };
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Enable minification in production
  swcMinify: true,
  
  // Enable source maps only in development
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',

  // Image optimization settings
  images: {
    domains: ['example.com'], // Add your image domains here
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack configuration (if needed)
  webpack: (config, { isServer }) => {
    // Add custom webpack configurations here if necessary
    return config;
  },

  // Internationalization settings (if needed)
  i18n: {
    locales: ['en', 'ja'],
    defaultLocale: 'ja',
  },

  // Trailing slash configuration
  trailingSlash: false,

  // Custom build directory (if needed)
  // distDir: 'build',

  // Enable gzip compression
  compress: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Configure the build ID (if needed)
  generateBuildId: async () => {
    // You can, for example, get the latest git commit hash here
    return 'my-build-id'
  },

  // Add environment variables (if needed)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Configure redirects (if needed)
  async redirects() {
    return [
      // Add your redirects here
    ]
  },
};

module.exports = nextConfig;
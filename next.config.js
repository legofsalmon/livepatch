/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Compress responses
  compress: true,
  
  // Experimental features for better performance  
  experimental: {
    // Better caching
    esmExternals: true,
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ],
      },
    ];
  },
}

module.exports = nextConfig

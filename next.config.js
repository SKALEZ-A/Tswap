/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude the components directory from being treated as pages
  pageExtensions: ['page.js', 'page.jsx', 'page.ts', 'page.tsx', 'js', 'jsx', 'ts', 'tsx'],
  // Configure webpack to handle the window is not defined error
  webpack: (config, { isServer }) => {
    // Fix for "window is not defined" error
    if (isServer) {
      config.externals = [...config.externals, 'react-dom']
    }
    return config
  },
  // Exclude specific paths from being treated as pages
  async rewrites() {
    return [
      {
        source: '/components/:path*',
        destination: '/404',
      },
    ];
  },
}

module.exports = nextConfig

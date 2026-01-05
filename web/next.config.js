/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  // Proxy API requests to backend (Only works in dev mode, ignored in export)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.1.47:8742/:path*',
      },
      {
        source: '/ws',
        destination: 'http://192.168.1.47:8742/ws',
      },
    ];
  },
};

module.exports = nextConfig;


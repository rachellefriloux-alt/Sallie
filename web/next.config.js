/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  // Proxy API requests to backend (Only works in dev mode, ignored in export)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.1.47:8742/api/:path*',
      },
      {
        source: '/ws',
        destination: 'http://192.168.1.47:8749/ws',
      },
      // Service-specific routes
      {
        source: '/api/limbic/:path*',
        destination: 'http://192.168.1.47:8750/api/:path*',
      },
      {
        source: '/api/memory/:path*',
        destination: 'http://192.168.1.47:8751/api/:path*',
      },
      {
        source: '/api/agency/:path*',
        destination: 'http://192.168.1.47:8752/api/:path*',
      },
      {
        source: '/api/communication/:path*',
        destination: 'http://192.168.1.47:8753/api/:path*',
      },
      {
        source: '/api/sensors/:path*',
        destination: 'http://192.168.1.47:8754/api/:path*',
      },
      {
        source: '/api/genesis/:path*',
        destination: 'http://192.168.1.47:8755/api/:path*',
      },
      {
        source: '/api/heritage/:path*',
        destination: 'http://192.168.1.47:8756/api/:path*',
      },
      {
        source: '/api/convergence/:path*',
        destination: 'http://192.168.1.47:8757/api/:path*',
      },
      {
        source: '/api/dashboard/:path*',
        destination: 'http://192.168.1.47:8758/api/:path*',
      },
    ];
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://192.168.1.47:8749',
    NEXT_PUBLIC_LIMBIC_URL: process.env.NEXT_PUBLIC_LIMBIC_URL || 'http://192.168.1.47:8750',
    NEXT_PUBLIC_MEMORY_URL: process.env.NEXT_PUBLIC_MEMORY_URL || 'http://192.168.1.47:8751',
    NEXT_PUBLIC_AGENCY_URL: process.env.NEXT_PUBLIC_AGENCY_URL || 'http://192.168.1.47:8752',
    NEXT_PUBLIC_COMMUNICATION_URL: process.env.NEXT_PUBLIC_COMMUNICATION_URL || 'http://192.168.1.47:8753',
    NEXT_PUBLIC_SENSORS_URL: process.env.NEXT_PUBLIC_SENSORS_URL || 'http://192.168.1.47:8754',
    NEXT_PUBLIC_GENESIS_URL: process.env.NEXT_PUBLIC_GENESIS_URL || 'http://192.168.1.47:8755',
    NEXT_PUBLIC_HERITAGE_URL: process.env.NEXT_PUBLIC_HERITAGE_URL || 'http://192.168.1.47:8756',
    NEXT_PUBLIC_CONVERGENCE_URL: process.env.NEXT_PUBLIC_CONVERGENCE_URL || 'http://192.168.1.47:8757',
    NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://192.168.1.47:8758',
  },
};

module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Proxy all frontend /api/* requests to your Render backend
        source: '/api/:path*',
        destination: `${process.env.RENDER_BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

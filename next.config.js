/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/service-worker.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 
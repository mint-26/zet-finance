/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      // Alias for the dental lead page; temporary so the path stays free for later use.
      { source: '/zahnkosten', destination: '/zahnzusatz', permanent: false },
    ];
  },
};

module.exports = nextConfig;

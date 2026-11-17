/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Chrome for the offer PDF (app/api/angebot/[id]): kept out of the bundle, its binaries traced in.
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
    outputFileTracingIncludes: {
      '/api/angebot/[id]': ['./node_modules/@sparticuz/chromium/bin/**'],
      '/api/angebot/[id]/senden': ['./node_modules/@sparticuz/chromium/bin/**'],
    },
  },
  async redirects() {
    return [
      // Alias for the dental lead page; temporary so the path stays free for later use.
      { source: '/zahnkosten', destination: '/zahnzusatz', permanent: false },
    ];
  },
};

module.exports = nextConfig;

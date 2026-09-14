import type { NextConfig } from 'next';

/**
 * Static security headers. The Content-Security-Policy is per-request (nonce-based) and is set in
 * proxy.ts; HSTS is set by the production edge proxy (see docs/DEPLOYMENT.md) so that local HTTP
 * development is never pinned to HTTPS.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  {
    // Microphone is same-origin only (experimental Breath-trace). Everything else is off.
    key: 'Permissions-Policy',
    value: [
      'microphone=(self)',
      'camera=()',
      'geolocation=()',
      'accelerometer=()',
      'gyroscope=()',
      'magnetometer=()',
      'payment=()',
      'usb=()',
      'bluetooth=()',
      'serial=()',
      'hid=()',
      'browsing-topics=()',
      'interest-cohort=()',
    ].join(', '),
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compress: true,
  env: {
    APP_VERSION: process.env.APP_VERSION ?? process.env.npm_package_version ?? '0.0.0',
    GIT_COMMIT: process.env.GIT_COMMIT ?? 'dev',
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;

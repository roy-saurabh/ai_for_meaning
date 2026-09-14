import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, Space_Mono } from 'next/font/google';
import { headers } from 'next/headers';
import { RevealObserver } from '@/components/layout/RevealObserver';
import { ThemeScript } from '@/components/layout/ThemeScript';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo/site';
import '@/styles/globals.css';

// Self-hosted at build time by next/font: no request to Google at runtime.
const fraunces = Fraunces({ subsets: ['latin'], style: 'normal', axes: ['opsz'], display: 'swap', variable: '--font-fraunces' });
// Italic is used for accents only: loaded on demand, not preloaded.
const frauncesItalic = Fraunces({
  subsets: ['latin'],
  style: 'italic',
  display: 'swap',
  preload: false,
  variable: '--font-fraunces-italic',
});
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  preload: false,
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false, email: false, address: false },
  other: { 'color-scheme': 'dark' },
};

export const viewport: Viewport = {
  themeColor: '#09091A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${frauncesItalic.variable} ${inter.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript nonce={nonce} />
      </head>
      <body>
        <div className="atmosphere" aria-hidden="true" />
        {children}
        <RevealObserver />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

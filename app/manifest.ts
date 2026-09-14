import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI for Meaning',
    short_name: 'Meaning',
    description: 'A living mirror for noticing your inner weather. Private by default. Not therapy.',
    start_url: '/mirror',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#09091A',
    theme_color: '#09091A',
    categories: ['lifestyle', 'health'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcuts: [
      { name: 'Enter the Mirror', url: '/mirror' },
      { name: 'Ground', url: '/ground' },
      { name: 'Inner Sky', url: '/sky' },
    ],
  };
}

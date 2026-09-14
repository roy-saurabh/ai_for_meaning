import Link from 'next/link';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({ title: 'Offline', description: 'You are offline.', path: '/offline', noindex: true });

export default function OfflinePage() {
  return (
    <div className="wrap flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <div className="orb-static h-20 w-20" aria-hidden="true" />
      <h1 className="display-md mt-10">You are offline.</h1>
      <p className="lead mt-4 max-w-[44ch]">
        That’s alright. If you have visited the Mirror before on this device, it still works without a connection.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/mirror" className="pill pill-primary">Enter the Mirror</Link>
        <Link href="/ground" className="pill">Ground</Link>
      </div>
    </div>
  );
}

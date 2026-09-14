import Link from 'next/link';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteNav } from '@/components/layout/SiteNav';

export default function RootNotFound() {
  return (
    <>
      <SiteNav />
      <main id="main" className="wrap flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="label-mono text-faint">404</p>
        <h1 className="display-md mt-5">This path leads nowhere in particular.</h1>
        <p className="lead mt-4 max-w-[40ch]">Which is fine. Nothing needs to be found here.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="pill pill-primary">Home</Link>
          <Link href="/mirror" className="pill">Enter the Mirror</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

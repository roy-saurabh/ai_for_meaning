'use client';

import Link from 'next/link';

/** Error boundary. Never shows stack traces or framework details. */
export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="wrap flex min-h-[80vh] flex-col items-center justify-center py-24 text-center">
      <div className="orb-static h-16 w-16 opacity-70" aria-hidden="true" />
      <h1 className="display-md mt-10">Something went quiet in the wrong way.</h1>
      <p className="lead mt-4 max-w-[44ch]">This page ran into a problem. Nothing you kept in your browser has been affected.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" className="pill pill-primary" onClick={reset}>Try again</button>
        <Link href="/" className="pill">Home</Link>
        <Link href="/ground" className="pill pill-ground">Ground</Link>
      </div>
    </main>
  );
}

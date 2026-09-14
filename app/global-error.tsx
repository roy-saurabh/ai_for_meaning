'use client';

/** Last-resort boundary when the root layout itself fails. Self-contained styles only. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#09091A', color: '#F4F0E9', fontFamily: 'Georgia, serif', textAlign: 'center', padding: 24 }}>
        <div>
          <h1 style={{ fontWeight: 400, fontSize: 32 }}>Something went quiet in the wrong way.</h1>
          <p style={{ color: '#ADA6C2', fontFamily: 'system-ui, sans-serif' }}>Please try again. Nothing kept in your browser has been affected.</p>
          <button type="button" onClick={reset} style={{ marginTop: 16, padding: '12px 24px', borderRadius: 999, border: '1px solid rgba(255,255,255,.2)', background: 'transparent', color: '#F4F0E9', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

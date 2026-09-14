import type { ReactNode } from 'react';
import { PageHeader } from './PageHeader';

export function ProsePage({ eyebrow, title, lead, updated, children }: { eyebrow: string; title: ReactNode; lead?: ReactNode; updated?: string; children: ReactNode }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} lead={lead}>
        {updated && <p className="fade-in mt-6 font-mono text-[0.72rem] tracking-[0.06em] text-faint">Last updated {updated}</p>}
      </PageHeader>
      <div className="wrap pb-24">
        <div className="prose-quiet text-[1.02rem] leading-relaxed">{children}</div>
      </div>
    </>
  );
}

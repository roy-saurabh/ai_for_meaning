import type { ReactNode } from 'react';

/** Header for editorial routes. One h1 per page. */
export function PageHeader({ eyebrow, title, lead, children }: { eyebrow: string; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="wrap pt-16 pb-10 md:pt-24 md:pb-14">
      <p className="eyebrow fade-in">{eyebrow}</p>
      <h1 className="display-lg fade-in mt-5 max-w-[20ch]">{title}</h1>
      {lead && <p className="lead fade-in mt-6 max-w-[62ch]">{lead}</p>}
      {children}
    </header>
  );
}

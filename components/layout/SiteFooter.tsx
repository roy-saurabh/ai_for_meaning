import Link from 'next/link';
import { OrbMark, Wordmark } from '@/components/brand/Wordmark';

const GROUPS = [
  {
    title: 'Experience',
    links: [
      { href: '/mirror', label: 'The Mirror' },
      { href: '/practice', label: 'Practice' },
      { href: '/sky', label: 'Inner Sky' },
      { href: '/settings', label: 'Settings' },
    ],
  },
  {
    title: 'Understanding',
    links: [
      { href: '/science', label: 'Science' },
      { href: '/references', label: 'References' },
      { href: '/manifesto', label: 'Manifesto' },
      { href: '/about', label: 'About' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/ground', label: 'Ground & safety' },
      { href: '/honest-mirror', label: 'The Honest Mirror' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-[var(--line)] pb-safe">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.3fr_2fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg py-1" aria-label="AI for Meaning — home">
            <OrbMark size={20} />
            <Wordmark />
          </Link>
          <p className="serif-italic mt-5 text-[1.15rem] text-muted">A mirror, not a master.</p>
          <p className="mt-6 max-w-[42ch] text-[0.9rem] leading-relaxed text-faint">
            For self-awareness and inner health. AI for Meaning is not therapy, medical care, diagnosis or a crisis
            service. If you may be in danger, contact your local emergency number.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="label-mono text-faint">{group.title}</h2>
              <ul className="mt-4 space-y-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-10 items-center text-[0.92rem] text-muted transition-colors hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="wrap flex flex-col gap-3 border-t border-[var(--line)] py-6 font-mono text-[0.72rem] tracking-[0.06em] text-faint sm:flex-row sm:justify-between">
        <p>aiformeaning.com · no trackers · no accounts · no ads</p>
        <p>self-awareness · private by default · not therapy</p>
      </div>
    </footer>
  );
}

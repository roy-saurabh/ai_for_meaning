import type { ReactNode } from 'react';

interface SectionProps {
  id?: string;
  eyebrow?: string;
  eyebrowColor?: string;
  title?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
  headingLevel?: 'h1' | 'h2';
  align?: 'left' | 'center';
  labelledBy?: string;
}

/** Editorial section with an optional mono eyebrow, serif title and quiet lead. */
export function Section({
  id,
  eyebrow,
  eyebrowColor,
  title,
  lead,
  children,
  className = '',
  headingLevel = 'h2',
  align = 'left',
}: SectionProps) {
  const Heading = headingLevel;
  const headingId = id ? `${id}-title` : undefined;
  const centered = align === 'center';
  return (
    <section id={id} aria-labelledby={title ? headingId : undefined} className={`py-20 md:py-28 ${className}`}>
      <div className="wrap">
        {(eyebrow || title || lead) && (
          <header className={`reveal mb-10 md:mb-14 ${centered ? 'mx-auto text-center' : ''}`}>
            {eyebrow && (
              <p className="eyebrow" style={eyebrowColor ? ({ '--eyebrow-color': eyebrowColor } as React.CSSProperties) : undefined}>
                {eyebrow}
              </p>
            )}
            {title && (
              <Heading id={headingId} className={`display-lg mt-4 max-w-[22ch] ${centered ? 'mx-auto' : ''}`}>
                {title}
              </Heading>
            )}
            {lead && <p className={`lead mt-5 max-w-[60ch] ${centered ? 'mx-auto' : ''}`}>{lead}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

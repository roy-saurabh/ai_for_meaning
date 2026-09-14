/** Typographic wordmark: "AI for Meaning", with a subtle warm emphasis on Meaning. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display text-[1.2rem] leading-none tracking-[-0.01em] ${className}`}>
      AI for <span className="serif-italic text-gold/95">Meaning</span>
    </span>
  );
}

/** The simplified orb/ring symbol used for icons and small marks. Decorative. */
export function OrbMark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id="orbmark-core" cx="50%" cy="46%" r="50%">
          <stop offset="0" stopColor="#FFF4DE" />
          <stop offset="0.35" stopColor="#F2C14E" />
          <stop offset="0.75" stopColor="#E8935B" stopOpacity="0.35" />
          <stop offset="1" stopColor="#9A8CFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="#9A8CFF" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="16" cy="16" r="10" fill="url(#orbmark-core)" />
    </svg>
  );
}

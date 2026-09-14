/** The persistent, calm non-clinical note. */
export function NotTherapyNote({ className = '' }: { className?: string }) {
  return (
    <p className={`label-mono normal-case tracking-[0.06em] text-faint ${className}`}>
      For self-awareness and inner health. Not therapy, medical care or a crisis service.
    </p>
  );
}

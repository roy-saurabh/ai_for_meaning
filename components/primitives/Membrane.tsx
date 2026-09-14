import type { CSSProperties, ElementType, ReactNode } from 'react';

type Size = 'sm' | 'md' | 'lg';

/** A thin panel in darkness. `glow` tints the internal illumination. */
export function Membrane({
  as: Tag = 'div',
  size = 'md',
  glow,
  className = '',
  children,
  ...rest
}: {
  as?: ElementType;
  size?: Size;
  glow?: string;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>) {
  const radius = size === 'lg' ? 'membrane-lg' : size === 'sm' ? 'membrane-sm' : '';
  const style = glow ? ({ '--membrane-glow': glow } as CSSProperties) : undefined;
  return (
    <Tag className={`membrane ${radius} ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}

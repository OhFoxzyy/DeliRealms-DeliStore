import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface SectionProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Section({ element, children }: SectionProps) {
  const style = element.style as React.CSSProperties;
  return (
    <section style={style}>
      {element.content.title && (
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', textAlign: (style.textAlign as React.CSSProperties['textAlign']) || 'left' }}>
          {element.content.title}
        </h2>
      )}
      {element.content.subtitle && (
        <p style={{ fontSize: '18px', color: 'var(--muted-foreground)', marginBottom: '32px' }}>
          {element.content.subtitle}
        </p>
      )}
      {children}
    </section>
  );
}

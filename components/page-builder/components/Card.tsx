import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface CardProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Card({ element, children }: CardProps) {
  return (
    <div style={element.style as React.CSSProperties}>
      {element.content.title && (
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
          {element.content.title}
        </h3>
      )}
      {element.content.description && (
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '16px' }}>
          {element.content.description}
        </p>
      )}
      {children}
    </div>
  );
}

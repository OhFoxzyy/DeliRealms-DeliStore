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
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: 'var(--page-text, #fafafa)' }}>
          {element.content.title}
        </h3>
      )}
      {element.content.description && (
        <p style={{ color: 'var(--page-text, #a3a3a3)', marginBottom: '16px', opacity: 0.9 }}>
          {element.content.description}
        </p>
      )}
      {children}
    </div>
  );
}

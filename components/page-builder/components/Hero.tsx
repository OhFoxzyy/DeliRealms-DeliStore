import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface HeroProps {
  element: PageElement;
}

export function Hero({ element }: HeroProps) {
  return (
    <div style={element.style as React.CSSProperties}>
      <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>
        {element.content.heading || 'Welcome to our store'}
      </h1>
      <p style={{ fontSize: '20px', marginBottom: '32px', color: 'var(--muted-foreground)' }}>
        {element.content.subheading || 'Discover amazing products'}
      </p>
      {element.content.buttonText && (
        <button
          style={{
            padding: '12px 32px',
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {element.content.buttonText}
        </button>
      )}
    </div>
  );
}

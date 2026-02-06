import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface LogoCloudProps {
  element: PageElement;
}

export function LogoCloud({ element }: LogoCloudProps) {
  const title = element.content.title ?? 'Trusted by teams everywhere';
  const logos = element.content.logos || [
    { name: 'Company 1', url: 'https://placehold.co/120x40/262626/737373?text=Logo+1' },
    { name: 'Company 2', url: 'https://placehold.co/120x40/262626/737373?text=Logo+2' },
    { name: 'Company 3', url: 'https://placehold.co/120x40/262626/737373?text=Logo+3' },
    { name: 'Company 4', url: 'https://placehold.co/120x40/262626/737373?text=Logo+4' },
  ];
  return (
    <div style={element.style as React.CSSProperties}>
      <p style={{ fontSize: '14px', color: 'var(--page-text, #737373)', textAlign: 'center', marginBottom: '24px' }}>
        {title}
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
        }}
      >
        {logos.map((logo: { name?: string; url?: string }, index: number) => (
          <img
            key={index}
            src={logo.url || 'https://placehold.co/120x40'}
            alt={logo.name ?? 'Logo'}
            style={{ height: '32px', width: 'auto', opacity: 0.8, filter: 'grayscale(1)' }}
          />
        ))}
      </div>
    </div>
  );
}

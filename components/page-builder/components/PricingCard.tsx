import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface PricingCardProps {
  element: PageElement;
}

export function PricingCard({ element }: PricingCardProps) {
  return (
    <div style={element.style as React.CSSProperties}>
      <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: 'var(--page-text, #fafafa)' }}>
        {element.content.title || 'Pro Plan'}
      </h3>
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '48px', fontWeight: '700', color: 'var(--page-text, #fafafa)' }}>
          {element.content.price || '$29'}
        </span>
        <span style={{ fontSize: '16px', color: 'var(--page-text, #737373)' }}>
          {element.content.period || '/month'}
        </span>
      </div>
      {element.content.features && Array.isArray(element.content.features) && (
        <ul style={{ textAlign: 'left', marginBottom: '24px', listStyle: 'none', padding: 0 }}>
          {element.content.features.map((feature: string, index: number) => (
            <li key={index} style={{ marginBottom: '8px', color: 'var(--page-text, #e5e5e5)' }}>
              ✓ {feature}
            </li>
          ))}
        </ul>
      )}
      {element.content.buttonText && (
        <button
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'var(--page-primary, #6366f1)',
            color: 'var(--page-background, #fff)',
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

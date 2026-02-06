import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface StatsProps {
  element: PageElement;
}

export function Stats({ element }: StatsProps) {
  const items = element.content.items || [
    { value: '10k+', label: 'Customers' },
    { value: '99%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
  ];
  return (
    <div style={element.style as React.CSSProperties}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '24px',
          width: '100%',
        }}
      >
        {items.map((item: { value?: string; label?: string }, index: number) => (
          <div
            key={index}
            style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: 'var(--page-surface, #171717)',
              borderRadius: '8px',
              border: '1px solid var(--page-border, #262626)',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--page-primary, #6366f1)', marginBottom: '4px' }}>
              {item.value ?? '—'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--page-text, #a3a3a3)' }}>
              {item.label ?? 'Label'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

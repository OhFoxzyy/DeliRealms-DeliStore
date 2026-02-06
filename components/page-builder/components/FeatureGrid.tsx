import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface FeatureGridProps {
  element: PageElement;
}

export function FeatureGrid({ element }: FeatureGridProps) {
  const features = element.content.features || [];
  
  return (
    <div style={element.style as React.CSSProperties}>
      {features.map((feature: any, index: number) => (
        <div
          key={index}
          style={{
            padding: '24px',
            backgroundColor: 'var(--page-surface, #171717)',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--page-text, #fafafa)' }}>
            {feature.title || `Feature ${index + 1}`}
          </h3>
          <p style={{ color: 'var(--page-text, #a3a3a3)' }}>
            {feature.description || 'Feature description'}
          </p>
        </div>
      ))}
    </div>
  );
}

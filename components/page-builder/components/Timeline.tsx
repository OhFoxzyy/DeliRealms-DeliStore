import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface TimelineProps {
  element: PageElement;
}

export function Timeline({ element }: TimelineProps) {
  const items = element.content.items || [];
  
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    paddingLeft: '32px',
    ...(element.style as React.CSSProperties),
  };

  return (
    <div
      style={baseStyle}
      className="timeline-component"
      role="list"
      aria-label={element.content.ariaLabel || 'Timeline'}
    >
      <style>{`
        .timeline-component::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--page-border, #262626);
        }
        .timeline-item {
          position: relative;
          marginBottom: 32px;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -24px;
          top: 4px;
          width: 12px;
          height: 12px;
          borderRadius: 50%;
          background: var(--page-primary, #6366f1);
          border: 2px solid var(--page-surface, #171717);
        }
      `}</style>
      {items.map((item: any, index: number) => (
        <div key={index} className="timeline-item">
          {item.date && (
            <div style={{ fontSize: '12px', color: 'var(--page-text, #737373)', marginBottom: '4px' }}>
              {item.date}
            </div>
          )}
          {item.title && (
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--page-text, #fafafa)', marginBottom: '8px' }}>
              {item.title}
            </h3>
          )}
          {item.description && (
            <p style={{ color: 'var(--page-text, #a3a3a3)', margin: 0 }}>
              {item.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

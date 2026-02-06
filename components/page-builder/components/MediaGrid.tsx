import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface MediaGridProps {
  element: PageElement;
}

export function MediaGrid({ element }: MediaGridProps) {
  const items = element.content.items || [];
  const columns = element.content.columns || 3;
  
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: element.content.gap || '16px',
    ...(element.style as React.CSSProperties),
  };

  return (
    <div
      style={gridStyle}
      className="media-grid-component"
      role="group"
      aria-label={element.content.ariaLabel || 'Media grid'}
    >
      <style>{`
        @media (max-width: 1024px) {
          .media-grid-component {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .media-grid-component {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {items.map((item: any, index: number) => (
        <div
          key={index}
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'var(--page-surface, #171717)',
          }}
        >
          {item.type === 'image' && (
            <img
              src={item.src}
              alt={item.alt || `Media ${index + 1}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          )}
          {item.type === 'video' && (
            <video
              src={item.src}
              controls
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

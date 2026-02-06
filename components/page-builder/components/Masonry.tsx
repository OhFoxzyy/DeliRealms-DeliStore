import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface MasonryProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Masonry({ element, children }: MasonryProps) {
  const columns = element.content.columns || 3;
  const gap = element.content.gap || '16px';
  
  const baseStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridAutoRows: '10px',
    gap: gap,
    width: '100%',
    ...(element.style as React.CSSProperties),
  };

  return (
    <div
      style={baseStyle}
      className="masonry-component"
      role="group"
      aria-label={element.content.ariaLabel || 'Masonry grid'}
    >
      <style>{`
        .masonry-component > * {
          grid-row: span var(--row-span, 20);
        }
        @media (max-width: 1024px) {
          .masonry-component {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .masonry-component {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
}

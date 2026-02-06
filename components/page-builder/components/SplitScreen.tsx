import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface SplitScreenProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function SplitScreen({ element, children }: SplitScreenProps) {
  const ratio = element.content.ratio || '50/50';
  const [left, right] = ratio.split('/').map(Number);
  const leftPercent = (left / (left + right)) * 100;
  
  const baseStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `${leftPercent}% ${100 - leftPercent}%`,
    gap: element.content.gap || '0',
    width: '100%',
    minHeight: '400px',
    ...(element.style as React.CSSProperties),
  };

  return (
    <div
      style={baseStyle}
      className="split-screen-component"
      role={element.content.role || 'group'}
      aria-label={element.content.ariaLabel}
    >
      <style>{`
        @media (max-width: 768px) {
          .split-screen-component {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
}

import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface AspectRatioProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function AspectRatio({ element, children }: AspectRatioProps) {
  const ratio = element.content.ratio || '16/9';
  const [width, height] = ratio.split('/').map(Number);
  const aspectRatio = width / height;
  
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingBottom: `${(1 / aspectRatio) * 100}%`,
    overflow: 'hidden',
    ...(element.style as React.CSSProperties),
  };

  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  };

  return (
    <div
      style={baseStyle}
      className="aspect-ratio-component"
      role={element.content.role}
      aria-label={element.content.ariaLabel}
    >
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
}

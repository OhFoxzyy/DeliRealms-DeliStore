import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface ContainerProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Container({ element, children }: ContainerProps) {
  const style = element.style as React.CSSProperties;
  const maxWidth = element.content.maxWidth || '100%';
  
  const baseStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: maxWidth === 'full' ? '100%' : maxWidth,
    margin: '0 auto',
    padding: 'clamp(16px, 3vw, 24px)',
    minHeight: (style.minHeight as string) || '60px',
    ...style,
  };

  return (
    <div
      style={baseStyle}
      className="container-component"
      role={element.content.role || 'region'}
      aria-label={element.content.ariaLabel}
    >
      {children}
    </div>
  );
}

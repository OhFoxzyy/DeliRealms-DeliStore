import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface CenterProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Center({ element, children }: CenterProps) {
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: element.content.minHeight || 'auto',
    ...(element.style as React.CSSProperties),
  };

  return (
    <div
      style={baseStyle}
      className="center-component"
      role={element.content.role || 'group'}
      aria-label={element.content.ariaLabel}
    >
      {children}
    </div>
  );
}

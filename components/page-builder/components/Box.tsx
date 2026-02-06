import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface BoxProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Box({ element, children }: BoxProps) {
  const baseStyle: React.CSSProperties = {
    padding: element.content.padding || '0',
    margin: element.content.margin || '0',
    width: '100%',
    ...(element.style as React.CSSProperties),
  };

  return (
    <div
      style={baseStyle}
      className="box-component"
      role={element.content.role}
      aria-label={element.content.ariaLabel}
    >
      {children}
    </div>
  );
}

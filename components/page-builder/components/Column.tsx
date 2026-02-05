import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface ColumnProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Column({ element, children }: ColumnProps) {
  return (
    <div style={element.style as React.CSSProperties}>
      {children}
    </div>
  );
}

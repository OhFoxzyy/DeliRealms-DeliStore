import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface GridProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Grid({ element, children }: GridProps) {
  return (
    <div style={element.style as React.CSSProperties}>
      {children}
    </div>
  );
}

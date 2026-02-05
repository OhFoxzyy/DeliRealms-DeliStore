import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface ContainerProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Container({ element, children }: ContainerProps) {
  const style = element.style as React.CSSProperties;
  return (
    <div style={{ ...style, minHeight: (style.minHeight as string) || '60px' }}>
      {children}
    </div>
  );
}

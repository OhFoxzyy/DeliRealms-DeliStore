import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface LinkProps {
  element: PageElement;
}

export function Link({ element }: LinkProps) {
  return (
    <a
      href={element.content.href || '#'}
      target={element.content.target || '_self'}
      style={element.style as React.CSSProperties}
    >
      {element.content.text || 'Click here'}
    </a>
  );
}

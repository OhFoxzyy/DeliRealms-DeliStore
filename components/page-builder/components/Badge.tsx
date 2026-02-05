import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface BadgeProps {
  element: PageElement;
}

export function Badge({ element }: BadgeProps) {
  return (
    <span style={element.style as React.CSSProperties}>
      {element.content.text || 'Badge'}
    </span>
  );
}

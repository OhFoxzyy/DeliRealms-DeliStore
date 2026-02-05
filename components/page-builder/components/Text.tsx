import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface TextProps {
  element: PageElement;
}

export function Text({ element }: TextProps) {
  return (
    <p style={element.style as React.CSSProperties}>
      {element.content.text || 'Your text here'}
    </p>
  );
}

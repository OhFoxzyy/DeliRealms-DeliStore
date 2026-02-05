import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface ImageProps {
  element: PageElement;
}

export function Image({ element }: ImageProps) {
  return (
    <img
      src={element.content.src || 'https://placehold.co/600x400'}
      alt={element.content.alt || ''}
      style={element.style as React.CSSProperties}
    />
  );
}

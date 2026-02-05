import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface HeadingProps {
  element: PageElement;
}

export function Heading({ element }: HeadingProps) {
  const level = (element.content.level as number) || 1;
  const tagName = `h${Math.min(Math.max(level, 1), 6)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  const Tag = tagName;
  
  return (
    <Tag style={element.style as React.CSSProperties}>
      {element.content.text || 'Heading Text'}
    </Tag>
  );
}

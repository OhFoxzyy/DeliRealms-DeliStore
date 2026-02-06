import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface TextProps {
  element: PageElement;
}

export function Text({ element }: TextProps) {
  const as = element.content.as || 'p';
  const Tag = as as keyof JSX.IntrinsicElements;
  
  const baseStyle: React.CSSProperties = {
    fontSize: 'clamp(14px, 1.5vw, 16px)',
    lineHeight: '1.6',
    color: 'var(--page-text, #a3a3a3)',
    margin: '0 0 clamp(12px, 2vw, 16px) 0',
    ...(element.style as React.CSSProperties),
  };

  return (
    <Tag
      style={baseStyle}
      className="text-component"
      dangerouslySetInnerHTML={element.content.html ? { __html: element.content.html } : undefined}
      aria-label={element.content.ariaLabel}
    >
      {!element.content.html && (element.content.text || 'Your text here')}
    </Tag>
  );
}

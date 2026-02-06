import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface RichTextProps {
  element: PageElement;
}

export function RichText({ element }: RichTextProps) {
  const content = element.content.html || element.content.text || '';
  
  const baseStyle: React.CSSProperties = {
    fontSize: 'clamp(14px, 1.5vw, 16px)',
    lineHeight: '1.6',
    color: 'var(--page-text, #a3a3a3)',
    ...(element.style as React.CSSProperties),
  };

  return (
    <div
      style={baseStyle}
      className="rich-text-component"
      dangerouslySetInnerHTML={element.content.html ? { __html: content } : undefined}
      role="article"
      aria-label={element.content.ariaLabel}
    >
      {!element.content.html && content}
    </div>
  );
}

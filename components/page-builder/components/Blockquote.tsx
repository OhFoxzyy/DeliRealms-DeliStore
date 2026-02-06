import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface BlockquoteProps {
  element: PageElement;
}

export function Blockquote({ element }: BlockquoteProps) {
  const quote = element.content.quote || '';
  const author = element.content.author;
  const citation = element.content.citation;
  
  const baseStyle: React.CSSProperties = {
    borderLeft: '4px solid var(--page-primary, #6366f1)',
    paddingLeft: '24px',
    margin: '24px 0',
    fontStyle: 'italic',
    fontSize: 'clamp(16px, 2vw, 20px)',
    lineHeight: '1.6',
    color: 'var(--page-text, #e5e5e5)',
    ...(element.style as React.CSSProperties),
  };

  return (
    <blockquote
      style={baseStyle}
      className="blockquote-component"
      cite={citation}
    >
      <p style={{ margin: '0 0 12px 0' }}>{quote}</p>
      {author && (
        <footer style={{ fontSize: '14px', color: 'var(--page-text, #737373)' }}>
          — {author}
        </footer>
      )}
    </blockquote>
  );
}

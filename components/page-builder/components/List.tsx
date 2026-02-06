import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface ListProps {
  element: PageElement;
}

export function List({ element }: ListProps) {
  const items = element.content.items || [];
  const ordered = element.content.ordered || false;
  const Tag = ordered ? 'ol' : 'ul';
  
  const baseStyle: React.CSSProperties = {
    paddingLeft: '24px',
    margin: '16px 0',
    color: 'var(--page-text, #a3a3a3)',
    ...(element.style as React.CSSProperties),
  };

  const itemStyle: React.CSSProperties = {
    marginBottom: '8px',
    lineHeight: '1.6',
  };

  return (
    <Tag
      style={baseStyle}
      className="list-component"
      role="list"
      aria-label={element.content.ariaLabel}
    >
      {items.map((item: string, index: number) => (
        <li key={index} style={itemStyle}>
          {item}
        </li>
      ))}
    </Tag>
  );
}

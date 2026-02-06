import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface FlexProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Flex({ element, children }: FlexProps) {
  const direction = element.content.direction || 'row';
  const wrap = element.content.wrap || 'nowrap';
  const gap = element.content.gap || '16px';
  const align = element.content.align || 'stretch';
  const justify = element.content.justify || 'flex-start';
  
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    flexWrap: wrap,
    gap: gap,
    alignItems: align,
    justifyContent: justify,
    width: '100%',
    ...(element.style as React.CSSProperties),
  };

  return (
    <div
      style={baseStyle}
      className="flex-component"
      role={element.content.role || 'group'}
      aria-label={element.content.ariaLabel}
    >
      {children}
    </div>
  );
}

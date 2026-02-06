import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface HeadingProps {
  element: PageElement;
}

export function Heading({ element }: HeadingProps) {
  const level = (element.content.level as number) || 1;
  const tagName = `h${Math.min(Math.max(level, 1), 6)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  const Tag = tagName;
  
  const fontSizeMap: Record<number, string> = {
    1: 'clamp(32px, 5vw, 48px)',
    2: 'clamp(28px, 4vw, 40px)',
    3: 'clamp(24px, 3vw, 32px)',
    4: 'clamp(20px, 2.5vw, 24px)',
    5: 'clamp(18px, 2vw, 20px)',
    6: 'clamp(16px, 1.5vw, 18px)',
  };

  const baseStyle: React.CSSProperties = {
    fontSize: fontSizeMap[level] || fontSizeMap[1],
    fontWeight: level <= 2 ? '700' : '600',
    lineHeight: '1.2',
    color: 'var(--page-text, #fafafa)',
    margin: '0 0 clamp(12px, 2vw, 16px) 0',
    ...(element.style as React.CSSProperties),
  };
  
  return (
    <Tag
      style={baseStyle}
      id={element.content.id}
      className="heading-component"
      aria-label={element.content.ariaLabel}
    >
      {element.content.text || 'Heading Text'}
    </Tag>
  );
}

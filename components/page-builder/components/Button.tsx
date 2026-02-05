import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface ButtonProps {
  element: PageElement;
}

export function Button({ element }: ButtonProps) {
  const href = element.content.href;
  const buttonContent = (
    <button style={element.style as React.CSSProperties}>
      {element.content.text || 'Click me'}
    </button>
  );

  if (href && href !== '#') {
    return (
      <a href={href} target={element.content.target || '_self'}>
        {buttonContent}
      </a>
    );
  }

  return buttonContent;
}

import React, { useState } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface TooltipProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Tooltip({ element, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const text = element.content.text || '';
  const position = element.content.position || 'top';
  
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    padding: '8px 12px',
    backgroundColor: 'var(--page-background, #0a0a0a)',
    color: 'var(--page-text, #fafafa)',
    borderRadius: '6px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    zIndex: 1000,
    opacity: isVisible ? 1 : 0,
    visibility: isVisible ? 'visible' : 'hidden',
    transition: 'opacity 0.2s ease, visibility 0.2s ease',
    pointerEvents: 'none',
    ...(position === 'top' && { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }),
    ...(position === 'bottom' && { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' }),
    ...(position === 'left' && { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' }),
    ...(position === 'right' && { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' }),
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      className="tooltip-component"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <div
        style={tooltipStyle}
        role="tooltip"
        aria-hidden={!isVisible}
      >
        {text}
      </div>
    </div>
  );
}

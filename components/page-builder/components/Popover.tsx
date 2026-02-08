'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface PopoverProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Popover({ element, children }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '8px',
    padding: '16px',
    backgroundColor: 'var(--page-surface, #171717)',
    border: '1px solid var(--page-border, #262626)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    minWidth: '200px',
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'opacity 0.2s ease, visibility 0.2s ease',
  };

  return (
    <div
      ref={popoverRef}
      style={{ position: 'relative', display: 'inline-block' }}
      className="popover-component"
    >
      <div onClick={() => setIsOpen(!isOpen)}>
        {children}
      </div>
      {isOpen && (
        <div
          style={contentStyle}
          role="dialog"
          aria-modal="false"
          aria-label={element.content.ariaLabel || 'Popover'}
        >
          {element.content.content}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface StickyHeaderProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function StickyHeader({ element, children }: StickyHeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const threshold = element.content.threshold || 100;
  
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > threshold);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const baseStyle: React.CSSProperties = {
    position: isSticky ? 'fixed' : 'relative',
    top: isSticky ? 0 : 'auto',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: isSticky 
      ? 'var(--page-surface, rgba(23, 23, 23, 0.95))' 
      : 'var(--page-surface, #171717)',
    backdropFilter: isSticky ? 'blur(10px)' : 'none',
    transition: 'all 0.3s ease',
    boxShadow: isSticky ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
    ...(element.style as React.CSSProperties),
  };

  return (
    <header
      style={baseStyle}
      className="sticky-header-component"
      role="banner"
      aria-label={element.content.ariaLabel || 'Sticky header'}
    >
      {children}
    </header>
  );
}

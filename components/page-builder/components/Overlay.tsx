import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface OverlayProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Overlay({ element, children }: OverlayProps) {
  const isOpen = element.content.isOpen !== false;
  const showBackdrop = element.content.showBackdrop !== false;
  
  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    ...(element.style as React.CSSProperties),
  };

  const backdropStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10000,
    maxWidth: element.content.maxWidth || '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
  };

  return (
    <div
      style={overlayStyle}
      className="overlay-component"
      role="dialog"
      aria-modal="true"
      aria-label={element.content.ariaLabel || 'Overlay'}
    >
      {showBackdrop && <div style={backdropStyle} aria-hidden="true" />}
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
}

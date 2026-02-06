import React, { useState } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface SidebarProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Sidebar({ element, children }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(element.content.defaultOpen !== false);
  const position = element.content.position || 'left';
  const width = element.content.width || '250px';
  
  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    [position]: isOpen ? 0 : `-${width}`,
    top: 0,
    bottom: 0,
    width: width,
    backgroundColor: 'var(--page-surface, #171717)',
    borderRight: position === 'left' ? '1px solid var(--page-border, #262626)' : 'none',
    borderLeft: position === 'right' ? '1px solid var(--page-border, #262626)' : 'none',
    zIndex: 1000,
    transition: `${position} 0.3s ease`,
    overflowY: 'auto',
    ...(element.style as React.CSSProperties),
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'opacity 0.3s ease, visibility 0.3s ease',
  };

  return (
    <>
      {element.content.showOverlay && (
        <div
          style={overlayStyle}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        style={sidebarStyle}
        className="sidebar-component"
        role="complementary"
        aria-label={element.content.ariaLabel || 'Sidebar'}
        aria-hidden={!isOpen}
      >
        {element.content.showToggle && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              position: 'absolute',
              top: '16px',
              [position === 'left' ? 'right' : 'left']: '16px',
              background: 'none',
              border: 'none',
              color: 'var(--page-text, #fafafa)',
              cursor: 'pointer',
              fontSize: '24px',
              zIndex: 1001,
            }}
            aria-label="Toggle sidebar"
            aria-expanded={isOpen}
          >
            {isOpen ? '✕' : '☰'}
          </button>
        )}
        {children}
      </aside>
    </>
  );
}

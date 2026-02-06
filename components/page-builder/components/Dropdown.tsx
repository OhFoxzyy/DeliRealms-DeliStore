import React, { useState, useRef, useEffect } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface DropdownProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Dropdown({ element, children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const items = element.content.items || [];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    backgroundColor: 'var(--page-surface, #171717)',
    border: '1px solid var(--page-border, #262626)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    minWidth: '200px',
    overflow: 'hidden',
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'opacity 0.2s ease, visibility 0.2s ease',
  };

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block' }}
      className="dropdown-component"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 16px',
          backgroundColor: 'var(--page-surface, #171717)',
          border: '1px solid var(--page-border, #262626)',
          borderRadius: '6px',
          color: 'var(--page-text, #e5e5e5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {element.content.label || 'Menu'}
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
          ▼
        </span>
      </button>
      <div
        style={menuStyle}
        role="menu"
        aria-label={element.content.ariaLabel || 'Dropdown menu'}
      >
        {items.map((item: any, index: number) => (
          <a
            key={index}
            href={item.href || '#'}
            role="menuitem"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'block',
              padding: '12px 16px',
              color: 'var(--page-text, #e5e5e5)',
              textDecoration: 'none',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--page-background, rgba(10, 10, 10, 0.5))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {item.label || `Item ${index + 1}`}
          </a>
        ))}
      </div>
    </div>
  );
}

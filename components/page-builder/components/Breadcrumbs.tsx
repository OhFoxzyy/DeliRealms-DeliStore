import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface BreadcrumbsProps {
  element: PageElement;
}

export function Breadcrumbs({ element }: BreadcrumbsProps) {
  const items = element.content.items || [];
  
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: 'var(--page-text, #737373)',
    ...(element.style as React.CSSProperties),
  };

  return (
    <nav
      style={baseStyle}
      className="breadcrumbs-component"
      role="navigation"
      aria-label="Breadcrumb"
    >
      {items.map((item: any, index: number) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span style={{ color: 'var(--page-text, #525252)' }} aria-hidden="true">
              /
            </span>
          )}
          {index === items.length - 1 ? (
            <span style={{ color: 'var(--page-text, #fafafa)', fontWeight: '500' }}>
              {item.label}
            </span>
          ) : (
            <a
              href={item.href || '#'}
              style={{
                color: 'var(--page-text, #737373)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--page-primary, #6366f1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--page-text, #737373)';
              }}
            >
              {item.label}
            </a>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface FooterProps {
  element: PageElement;
}

export function Footer({ element }: FooterProps) {
  const links = element.content.links || [];
  const columns = element.content.columns || [];
  
  return (
    <footer style={element.style as React.CSSProperties}>
      {columns.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr)`, gap: '32px' }}>
          {columns.map((column: any, index: number) => (
            <div key={index}>
              {column.title && (
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--page-text, #fafafa)' }}>
                  {column.title}
                </h4>
              )}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(column.links || []).map((link: any, linkIndex: number) => (
                  <li key={linkIndex} style={{ marginBottom: '8px' }}>
                    <a href={link.href || '#'} style={{ color: 'var(--page-text, #a3a3a3)', textDecoration: 'none' }}>
                      {link.text || `Link ${linkIndex + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--page-text, #737373)' }}>
          {element.content.copyright || `© ${new Date().getFullYear()} Your Company`}
        </div>
      )}
    </footer>
  );
}

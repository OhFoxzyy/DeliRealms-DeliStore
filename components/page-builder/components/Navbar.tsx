import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface NavbarProps {
  element: PageElement;
}

export function Navbar({ element }: NavbarProps) {
  const links = element.content.links || [];
  
  return (
    <nav style={element.style as React.CSSProperties}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ fontSize: '20px', fontWeight: '700' }}>
          {element.content.logo || 'Logo'}
        </div>
        <ul style={{ display: 'flex', gap: '24px', listStyle: 'none', padding: 0, margin: 0 }}>
          {links.map((link: any, index: number) => (
            <li key={index}>
              <a
                href={link.href || '#'}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {link.text || `Link ${index + 1}`}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

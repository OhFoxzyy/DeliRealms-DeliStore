'use client';

import React, { useState, useEffect } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface NavbarProps {
  element: PageElement;
}

export function Navbar({ element }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const links = element.content.links || [];
  const sticky = element.content.sticky !== false;
  const logo = element.content.logo || 'Logo';
  const logoImage = element.content.logoImage;
  
  useEffect(() => {
    if (!sticky) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  const baseStyle: React.CSSProperties = {
    position: sticky ? 'sticky' : 'relative',
    top: 0,
    zIndex: 1000,
    padding: 'clamp(12px, 2vw, 16px) clamp(20px, 4vw, 24px)',
    backgroundColor: isScrolled 
      ? 'var(--page-surface, rgba(23, 23, 23, 0.95))' 
      : 'var(--page-surface, #171717)',
    borderBottom: '1px solid var(--page-border, #262626)',
    backdropFilter: isScrolled ? 'blur(10px)' : 'none',
    transition: 'all 0.3s ease',
    ...(element.style as React.CSSProperties),
  };

  return (
    <nav
      style={baseStyle}
      className="navbar-component"
      role="navigation"
      aria-label="Main navigation"
    >
      <style>{`
        .navbar-component .mobile-menu {
          display: none;
        }
        @media (max-width: 768px) {
          .navbar-component .desktop-menu {
            display: none;
          }
          .navbar-component .mobile-menu {
            display: block;
          }
        }
      `}</style>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
      }}>
        <a
          href={element.content.logoHref || '/'}
          style={{
            fontSize: 'clamp(18px, 2vw, 20px)',
            fontWeight: '700',
            color: 'var(--page-text, #fafafa)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          aria-label="Home"
        >
          {logoImage ? (
            <img
              src={logoImage}
              alt={logo}
              style={{ height: '32px', width: 'auto' }}
            />
          ) : (
            logo
          )}
        </a>
        
        {/* Desktop Menu */}
        <ul
          className="desktop-menu"
          style={{
            display: 'flex',
            gap: 'clamp(16px, 2vw, 24px)',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            alignItems: 'center',
          }}
        >
          {links.map((link: any, index: number) => (
            <li key={index}>
              <a
                href={link.href || '#'}
                style={{
                  color: 'var(--page-text, #e5e5e5)',
                  textDecoration: 'none',
                  fontSize: 'clamp(14px, 1.5vw, 16px)',
                  fontWeight: '500',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--page-background, rgba(10, 10, 10, 0.5))';
                  e.currentTarget.style.color = 'var(--page-primary, #6366f1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--page-text, #e5e5e5)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid var(--page-primary, #6366f1)';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                {link.text || `Link ${index + 1}`}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--page-text, #fafafa)',
            cursor: 'pointer',
            padding: '8px',
            fontSize: '24px',
          }}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu"
          style={{
            display: 'block',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--page-border, #262626)',
          }}
        >
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {links.map((link: any, index: number) => (
              <li key={index}>
                <a
                  href={link.href || '#'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    color: 'var(--page-text, #e5e5e5)',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    padding: '12px',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = '2px solid var(--page-primary, #6366f1)';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                >
                  {link.text || `Link ${index + 1}`}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

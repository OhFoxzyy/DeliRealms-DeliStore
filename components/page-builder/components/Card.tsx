import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface CardProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Card({ element, children }: CardProps) {
  const baseStyle: React.CSSProperties = {
    padding: 'clamp(20px, 3vw, 24px)',
    backgroundColor: 'var(--page-surface, #171717)',
    borderRadius: '12px',
    border: '1px solid var(--page-border, #262626)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...(element.style as React.CSSProperties),
  };

  const hasHover = element.content.hoverEffect !== false;

  return (
    <article
      style={baseStyle}
      className="card-component"
      role="article"
      aria-labelledby={element.content.title ? `card-title-${element.id}` : undefined}
      onMouseEnter={(e) => {
        if (hasHover) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.borderColor = 'var(--page-primary, #6366f1)';
        }
      }}
      onMouseLeave={(e) => {
        if (hasHover) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'var(--page-border, #262626)';
        }
      }}
    >
      {element.content.image && (
        <div
          style={{
            width: '100%',
            height: '200px',
            marginBottom: '16px',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'var(--page-background, #0a0a0a)',
          }}
        >
          <img
            src={element.content.image}
            alt={element.content.imageAlt || element.content.title || 'Card image'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            loading="lazy"
          />
        </div>
      )}
      {element.content.title && (
        <h3
          id={`card-title-${element.id}`}
          style={{
            fontSize: 'clamp(18px, 2vw, 20px)',
            fontWeight: '600',
            marginBottom: '12px',
            color: 'var(--page-text, #fafafa)',
            lineHeight: '1.4',
          }}
        >
          {element.content.title}
        </h3>
      )}
      {element.content.description && (
        <p
          style={{
            color: 'var(--page-text, #a3a3a3)',
            marginBottom: '16px',
            opacity: 0.9,
            fontSize: 'clamp(14px, 1.5vw, 16px)',
            lineHeight: '1.6',
            flex: 1,
          }}
        >
          {element.content.description}
        </p>
      )}
      {children && (
        <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
          {children}
        </div>
      )}
      {element.content.footer && (
        <footer
          style={{
            marginTop: 'auto',
            paddingTop: '16px',
            borderTop: '1px solid var(--page-border, #262626)',
            fontSize: '14px',
            color: 'var(--page-text, #737373)',
          }}
        >
          {element.content.footer}
        </footer>
      )}
    </article>
  );
}

import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface ProductCardProps {
  element: PageElement;
}

export function ProductCard({ element }: ProductCardProps) {
  const title = element.content.title ?? 'Product name';
  const price = element.content.price ?? '$29';
  const imageSrc = element.content.imageSrc ?? 'https://placehold.co/400x300/171717/404040?text=Product';
  const imageAlt = element.content.imageAlt ?? title;
  const buttonText = element.content.buttonText ?? 'Add to cart';
  const buttonHref = element.content.buttonHref ?? '#';
  return (
    <div style={element.style as React.CSSProperties}>
      <div
        style={{
          backgroundColor: 'var(--page-surface, #171717)',
          borderRadius: '12px',
          border: '1px solid var(--page-border, #262626)',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          style={{ width: '100%', height: 'auto', aspectRatio: '4/3', objectFit: 'cover' }}
        />
        <div style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--page-text, #fafafa)' }}>
            {title}
          </h3>
          <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--page-primary, #6366f1)', marginBottom: '16px' }}>
            {price}
          </p>
          <a
            href={buttonHref}
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: 'var(--page-primary, #6366f1)',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>
    </div>
  );
}

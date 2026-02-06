import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface NewsletterProps {
  element: PageElement;
}

export function Newsletter({ element }: NewsletterProps) {
  const title = element.content.title ?? 'Subscribe to our newsletter';
  const description = element.content.description ?? 'Get the latest updates and offers.';
  const placeholder = element.content.placeholder ?? 'Enter your email';
  const buttonText = element.content.buttonText ?? 'Subscribe';
  return (
    <div style={element.style as React.CSSProperties}>
      <div
        style={{
          padding: '32px',
          backgroundColor: 'var(--page-surface, #171717)',
          borderRadius: '12px',
          border: '1px solid var(--page-border, #262626)',
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--page-text, #fafafa)' }}>
          {title}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--page-text, #a3a3a3)', marginBottom: '20px' }}>
          {description}
        </p>
        <form
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder={placeholder}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--page-border, #262626)',
              backgroundColor: 'var(--page-background, #0a0a0a)',
              color: 'var(--page-text, #fafafa)',
              fontSize: '14px',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 20px',
              backgroundColor: 'var(--page-primary, #6366f1)',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
}

import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface TestimonialProps {
  element: PageElement;
}

export function Testimonial({ element }: TestimonialProps) {
  const quote = element.content.quote ?? 'This product changed how we work. Highly recommend.';
  const author = element.content.author ?? 'Jane Doe';
  const role = element.content.role ?? 'Customer';
  return (
    <div style={element.style as React.CSSProperties}>
      <blockquote
        style={{
          padding: '32px',
          backgroundColor: 'var(--page-surface, #171717)',
          borderRadius: '12px',
          borderLeft: '4px solid var(--page-primary, #6366f1)',
          margin: 0,
        }}
      >
        <p style={{ fontSize: '18px', lineHeight: '1.6', color: 'var(--page-text, #fafafa)', marginBottom: '20px' }}>
          "{quote}"
        </p>
        <footer>
          <strong style={{ color: 'var(--page-text, #fafafa)' }}>{author}</strong>
          <span style={{ color: 'var(--page-text, #737373)', marginLeft: '8px' }}>{role}</span>
        </footer>
      </blockquote>
    </div>
  );
}

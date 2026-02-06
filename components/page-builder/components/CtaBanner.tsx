import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface CtaBannerProps {
  element: PageElement;
}

export function CtaBanner({ element }: CtaBannerProps) {
  const heading = element.content.heading ?? 'Ready to get started?';
  const subtext = element.content.subtext ?? 'Join thousands of satisfied customers today.';
  const buttonText = element.content.buttonText ?? 'Get started';
  const buttonHref = element.content.buttonHref ?? '#';
  return (
    <div style={element.style as React.CSSProperties}>
      <div
        style={{
          padding: '48px 24px',
          borderRadius: '12px',
          background: 'var(--page-primary, #6366f1)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>
          {heading}
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '24px' }}>
          {subtext}
        </p>
        <a
          href={buttonHref}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#fff',
            color: 'var(--page-primary, #6366f1)',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}

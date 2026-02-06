import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface FaqProps {
  element: PageElement;
}

export function Faq({ element }: FaqProps) {
  const items = element.content.items || [
    { question: 'How do I get started?', answer: 'Sign up and follow the onboarding steps.' },
    { question: 'What payment methods do you accept?', answer: 'We accept all major cards and PayPal.' },
    { question: 'Can I cancel anytime?', answer: 'Yes, cancel from your account settings.' },
  ];
  const title = element.content.title ?? 'Frequently asked questions';
  return (
    <div style={element.style as React.CSSProperties}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: 'var(--page-text, #fafafa)' }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item: { question?: string; answer?: string }, index: number) => (
          <div
            key={index}
            style={{
              padding: '20px',
              backgroundColor: 'var(--page-surface, #171717)',
              borderRadius: '8px',
              border: '1px solid var(--page-border, #262626)',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'var(--page-text, #fafafa)' }}>
              {item.question ?? 'Question'}
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--page-text, #a3a3a3)', margin: 0 }}>
              {item.answer ?? 'Answer'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

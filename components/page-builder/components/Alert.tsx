import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface AlertProps {
  element: PageElement;
}

export function Alert({ element }: AlertProps) {
  const variant = element.content.variant || 'info';
  const variantStyles: Record<string, { backgroundColor: string; color: string; borderColor: string }> = {
    info: { backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--page-primary, #6366f1)', borderColor: 'var(--page-primary, #6366f1)' },
    success: { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderColor: '#22c55e' },
    warning: { backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308', borderColor: '#eab308' },
    error: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: '#ef4444' },
  };

  const style = variantStyles[variant] || variantStyles.info;

  return (
    <div
      style={{
        ...(element.style as React.CSSProperties),
        padding: '12px 16px',
        borderRadius: '6px',
        border: `1px solid ${style.borderColor}`,
        backgroundColor: style.backgroundColor,
        color: style.color,
      }}
    >
      {element.content.title && (
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          {element.content.title}
        </div>
      )}
      {element.content.message || element.content.text || 'Alert message'}
    </div>
  );
}

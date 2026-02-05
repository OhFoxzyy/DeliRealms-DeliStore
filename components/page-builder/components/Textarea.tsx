import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface TextareaProps {
  element: PageElement;
}

export function Textarea({ element }: TextareaProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {element.content.label && (
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
          {element.content.label}
        </label>
      )}
      <textarea
        placeholder={element.content.placeholder || ''}
        name={element.content.name || ''}
        rows={element.content.rows || 4}
        required={element.content.required || false}
        style={{
          ...(element.style as React.CSSProperties),
          width: '100%',
          padding: '10px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--input)',
          color: 'var(--foreground)',
          resize: 'vertical',
        }}
      />
    </div>
  );
}

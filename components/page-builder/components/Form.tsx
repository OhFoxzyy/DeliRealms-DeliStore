import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface FormProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function Form({ element, children }: FormProps) {
  return (
    <form
      action={element.content.action || '#'}
      method={element.content.method || 'POST'}
      style={element.style as React.CSSProperties}
    >
      {children}
      {element.content.submitText && (
        <button
          type="submit"
          style={{
            padding: '12px 24px',
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            marginTop: '16px',
          }}
        >
          {element.content.submitText}
        </button>
      )}
    </form>
  );
}

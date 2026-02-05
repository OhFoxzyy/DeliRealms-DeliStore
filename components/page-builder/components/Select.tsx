import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface SelectProps {
  element: PageElement;
}

export function Select({ element }: SelectProps) {
  const options = element.content.options || [];
  
  return (
    <div style={{ marginBottom: '16px' }}>
      {element.content.label && (
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
          {element.content.label}
        </label>
      )}
      <select
        name={element.content.name || ''}
        required={element.content.required || false}
        style={{
          ...(element.style as React.CSSProperties),
          width: '100%',
          padding: '10px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--input)',
          color: 'var(--foreground)',
        }}
      >
        {element.content.placeholder && (
          <option value="">{element.content.placeholder}</option>
        )}
        {options.map((option: any, index: number) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  );
}

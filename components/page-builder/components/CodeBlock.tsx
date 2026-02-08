import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface CodeBlockProps {
  element: PageElement;
}

export function CodeBlock({ element }: CodeBlockProps) {
  const code = element.content.code || '';
  const language = element.content.language || 'javascript';
  const showLineNumbers = element.content.showLineNumbers !== false;
  
  const baseStyle: React.CSSProperties = {
    backgroundColor: 'var(--page-background, #0a0a0a)',
    border: '1px solid var(--page-border, #262626)',
    borderRadius: '8px',
    padding: '16px',
    overflowX: 'auto',
    fontFamily: 'monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    color: 'var(--page-text, #e5e5e5)',
    ...(element.style as React.CSSProperties),
  };

  const lines = code.split('\n');

  return (
    <pre
      style={baseStyle}
      className="code-block-component"
      role="region"
      aria-label={`Code block: ${language}`}
    >
      <code>
        {showLineNumbers ? (
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--page-text, #737373)', userSelect: 'none' }}>
              {lines.map((_: any, i: any) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              {code}
            </div>
          </div>
        ) : (
          code
        )}
      </code>
    </pre>
  );
}

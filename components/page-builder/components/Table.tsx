import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface TableProps {
  element: PageElement;
}

export function Table({ element }: TableProps) {
  const headers = element.content.headers || [];
  const rows = element.content.rows || [];
  const striped = element.content.striped !== false;
  
  const baseStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'var(--page-surface, #171717)',
    borderRadius: '8px',
    overflow: 'hidden',
    ...(element.style as React.CSSProperties),
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: 'var(--page-background, #0a0a0a)',
    color: 'var(--page-text, #fafafa)',
    fontWeight: '600',
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '2px solid var(--page-border, #262626)',
  };

  const cellStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid var(--page-border, #262626)',
    color: 'var(--page-text, #a3a3a3)',
  };

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table
        style={baseStyle}
        className="table-component"
        role="table"
        aria-label={element.content.ariaLabel || 'Data table'}
      >
        <thead>
          <tr>
            {headers.map((header: string, index: number) => (
              <th key={index} style={headerStyle}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: string[], rowIndex: number) => (
            <tr
              key={rowIndex}
              style={{
                backgroundColor: striped && rowIndex % 2 === 0
                  ? 'var(--page-background, rgba(10, 10, 10, 0.5))'
                  : 'transparent',
              }}
            >
              {row.map((cell: string, cellIndex: number) => (
                <td key={cellIndex} style={cellStyle}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

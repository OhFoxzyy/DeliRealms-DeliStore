import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface ProgressBarProps {
  element: PageElement;
}

export function ProgressBar({ element }: ProgressBarProps) {
  const value = Math.min(Math.max(element.content.value || 0, 0), 100);
  const showLabel = element.content.showLabel !== false;
  const label = element.content.label;
  
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: element.content.height || '8px',
    backgroundColor: 'var(--page-surface, #171717)',
    borderRadius: '4px',
    overflow: 'hidden',
    ...(element.style as React.CSSProperties),
  };

  const barStyle: React.CSSProperties = {
    width: `${value}%`,
    height: '100%',
    backgroundColor: 'var(--page-primary, #6366f1)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  };

  return (
    <div className="progress-bar-component" style={{ width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px',
            color: 'var(--page-text, #a3a3a3)',
          }}
        >
          <span>{label || 'Progress'}</span>
          <span>{value}%</span>
        </div>
      )}
      <div
        style={containerStyle}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress bar'}
      >
        <div style={barStyle} />
      </div>
    </div>
  );
}

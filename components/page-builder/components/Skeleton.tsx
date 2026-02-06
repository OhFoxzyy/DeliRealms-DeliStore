import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface SkeletonProps {
  element: PageElement;
}

export function Skeleton({ element }: SkeletonProps) {
  const variant = element.content.variant || 'text';
  const width = element.content.width || '100%';
  const height = element.content.height || '20px';
  
  const baseStyle: React.CSSProperties = {
    backgroundColor: 'var(--page-surface, #171717)',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
    ...(element.style as React.CSSProperties),
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    text: {
      width: width,
      height: height,
    },
    circular: {
      width: height,
      height: height,
      borderRadius: '50%',
    },
    rectangular: {
      width: width,
      height: height,
    },
  };

  return (
    <div
      style={{ ...baseStyle, ...variantStyles[variant] }}
      className="skeleton-component"
      aria-label="Loading"
      aria-live="polite"
    >
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

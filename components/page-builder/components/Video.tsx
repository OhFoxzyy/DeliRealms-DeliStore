import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface VideoProps {
  element: PageElement;
}

export function Video({ element }: VideoProps) {
  if (!element.content.src) {
    return (
      <div style={{ ...(element.style as React.CSSProperties), display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--muted)', minHeight: '200px' }}>
        <span className="text-muted-foreground">Video placeholder</span>
      </div>
    );
  }

  return (
    <video src={element.content.src} controls style={element.style as React.CSSProperties} />
  );
}

'use client';

import React, { useState } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface AudioPlayerProps {
  element: PageElement;
}

export function AudioPlayer({ element }: AudioPlayerProps) {
  const src = element.content.src || '';
  const title = element.content.title || 'Audio';
  
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--page-surface, #171717)',
        borderRadius: '8px',
        border: '1px solid var(--page-border, #262626)',
        ...(element.style as React.CSSProperties),
      }}
      className="audio-player-component"
    >
      {title && (
        <div style={{ marginBottom: '12px', color: 'var(--page-text, #fafafa)', fontWeight: '600' }}>
          {title}
        </div>
      )}
      <audio
        src={src}
        controls
        style={{ width: '100%' }}
        aria-label={title}
      />
    </div>
  );
}

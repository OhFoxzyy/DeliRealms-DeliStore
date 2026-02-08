'use client';

import React, { useState } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface ImageProps {
  element: PageElement;
}

export function Image({ element }: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    objectFit: element.content.objectFit || 'cover',
    transition: 'opacity 0.3s ease',
    opacity: isLoading ? 0 : 1,
    ...(element.style as React.CSSProperties),
  };

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: '8px',
    backgroundColor: 'var(--page-background, #0a0a0a)',
    ...(element.content.aspectRatio && {
      aspectRatio: element.content.aspectRatio,
    }),
  };

  return (
    <div style={wrapperStyle} className="image-wrapper">
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--page-surface, #171717)',
            color: 'var(--page-text, #737373)',
          }}
          aria-hidden="true"
        >
          Loading...
        </div>
      )}
      {hasError ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--page-surface, #171717)',
            color: 'var(--page-text, #737373)',
            padding: '40px',
            textAlign: 'center',
          }}
          role="img"
          aria-label={element.content.alt || 'Image failed to load'}
        >
          Image failed to load
        </div>
      ) : (
        <img
          src={element.content.src || 'https://placehold.co/600x400'}
          alt={element.content.alt || element.content.title || 'Image'}
          style={baseStyle}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          loading={element.content.loading || 'lazy'}
          decoding="async"
          aria-label={element.content.ariaLabel || element.content.alt}
        />
      )}
    </div>
  );
}

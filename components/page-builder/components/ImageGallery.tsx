import React, { useState } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface ImageGalleryProps {
  element: PageElement;
}

export function ImageGallery({ element }: ImageGalleryProps) {
  const images = element.content.images || [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${element.content.columns || 3}, 1fr)`,
    gap: '16px',
    ...(element.style as React.CSSProperties),
  };

  return (
    <>
      <div style={gridStyle} className="image-gallery-component" role="group" aria-label="Image gallery">
        {images.map((img: any, index: number) => (
          <div
            key={index}
            onClick={() => {
              setSelectedIndex(index);
              setLightboxOpen(true);
            }}
            style={{
              cursor: 'pointer',
              overflow: 'hidden',
              borderRadius: '8px',
              aspectRatio: '1',
            }}
          >
            <img
              src={img.src || img}
              alt={img.alt || `Image ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          </div>
        ))}
      </div>
      {lightboxOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={images[selectedIndex]?.src || images[selectedIndex]}
            alt={images[selectedIndex]?.alt || `Image ${selectedIndex + 1}`}
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
          />
        </div>
      )}
    </>
  );
}

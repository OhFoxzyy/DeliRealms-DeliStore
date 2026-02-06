import React, { useState, useEffect } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface CarouselProps {
  element: PageElement;
}

export function Carousel({ element }: CarouselProps) {
  const items = element.content.items || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlay = element.content.autoPlay || false;
  const interval = element.content.interval || 5000;
  
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '8px',
        ...(element.style as React.CSSProperties),
      }}
      className="carousel-component"
      role="region"
      aria-label="Carousel"
    >
      <div
        style={{
          display: 'flex',
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'transform 0.5s ease',
        }}
      >
        {items.map((item: any, index: number) => (
          <div key={index} style={{ minWidth: '100%', flexShrink: 0 }}>
            {item}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '8px 12px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              borderRadius: '50%',
              color: '#fff',
              cursor: 'pointer',
            }}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '8px 12px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              borderRadius: '50%',
              color: '#fff',
              cursor: 'pointer',
            }}
            aria-label="Next slide"
          >
            ›
          </button>
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
            }}
          >
            {items.map((_, index: number) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: index === currentIndex ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

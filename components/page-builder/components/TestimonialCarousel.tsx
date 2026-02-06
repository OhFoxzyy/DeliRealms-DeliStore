import React, { useState, useEffect } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface TestimonialCarouselProps {
  element: PageElement;
}

export function TestimonialCarousel({ element }: TestimonialCarouselProps) {
  const source = element.content.source || 'static';
  const [testimonials, setTestimonials] = useState(element.content.testimonials || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlay = element.content.autoPlay || false;
  const interval = element.content.interval || 5000;
  
  useEffect(() => {
    if (source === 'api' && element.content.sourceUrl) {
      fetch(element.content.sourceUrl)
        .then(res => res.json())
        .then(data => setTestimonials(data))
        .catch(() => {});
    }
  }, [source, element.content.sourceUrl]);
  
  useEffect(() => {
    if (!autoPlay || testimonials.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoPlay, interval, testimonials.length]);

  const current = testimonials[currentIndex] || {};

  return (
    <div
      style={{
        padding: '40px',
        backgroundColor: 'var(--page-surface, #171717)',
        borderRadius: '12px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
        ...(element.style as React.CSSProperties),
      }}
      className="testimonial-carousel-component"
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>"</div>
      <p style={{ fontSize: '20px', lineHeight: '1.6', color: 'var(--page-text, #e5e5e5)', marginBottom: '24px' }}>
        {current.quote || current.text}
      </p>
      <div>
        <div style={{ fontWeight: '600', color: 'var(--page-text, #fafafa)', marginBottom: '4px' }}>
          {current.author || current.name}
        </div>
        {current.role && (
          <div style={{ fontSize: '14px', color: 'var(--page-text, #737373)' }}>
            {current.role}
          </div>
        )}
        {current.source && (
          <div style={{ fontSize: '12px', color: 'var(--page-text, #525252)', marginTop: '4px' }}>
            Source: {current.source}
          </div>
        )}
      </div>
      {testimonials.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {testimonials.map((_, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: index === currentIndex ? 'var(--page-primary, #6366f1)' : 'var(--page-border, #262626)',
                cursor: 'pointer',
              }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

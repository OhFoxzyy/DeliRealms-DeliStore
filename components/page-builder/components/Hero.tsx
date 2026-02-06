import React, { useState } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface HeroProps {
  element: PageElement;
}

export function Hero({ element }: HeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const backgroundImage = element.content.backgroundImage;
  const imageSrc = element.content.imageSrc;
  
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: '500px',
    padding: 'clamp(40px, 8vw, 80px) clamp(20px, 4vw, 40px)',
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    ...(element.style as React.CSSProperties),
  };

  return (
    <section
      style={baseStyle}
      className="hero-section"
      role="banner"
      aria-label="Hero section"
    >
      <style>{`
        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${backgroundImage ? 'rgba(0, 0, 0, 0.4)' : 'transparent'};
          z-index: 1;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          width: 100%;
        }
        @media (max-width: 768px) {
          .hero-section {
            min-height: 400px;
            padding: 40px 20px;
          }
        }
      `}</style>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={element.content.imageAlt || 'Hero image'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
            zIndex: 0,
          }}
          onLoad={() => setImageLoaded(true)}
          loading="eager"
          aria-hidden="true"
        />
      )}
      <div className="hero-content">
        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: '700',
            marginBottom: 'clamp(16px, 2vw, 24px)',
            color: 'var(--page-text, #fafafa)',
            lineHeight: '1.2',
            textShadow: backgroundImage || imageSrc ? '0 2px 8px rgba(0, 0, 0, 0.5)' : 'none',
          }}
        >
          {element.content.heading || 'Welcome to our store'}
        </h1>
        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            marginBottom: 'clamp(24px, 4vw, 32px)',
            color: 'var(--page-text, #a3a3a3)',
            opacity: 0.95,
            lineHeight: '1.6',
            textShadow: backgroundImage || imageSrc ? '0 1px 4px rgba(0, 0, 0, 0.5)' : 'none',
          }}
        >
          {element.content.subheading || 'Discover amazing products'}
        </p>
        {element.content.buttonText && (
          <a
            href={element.content.buttonHref || '#'}
            style={{
              display: 'inline-block',
              padding: 'clamp(12px, 1.5vw, 16px) clamp(24px, 3vw, 32px)',
              backgroundColor: 'var(--page-primary, #6366f1)',
              color: 'var(--page-background, #fff)',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--page-primary, #6366f1)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            aria-label={`${element.content.buttonText} - ${element.content.heading || 'Hero CTA'}`}
          >
            {element.content.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

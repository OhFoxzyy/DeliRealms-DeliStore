'use client';

import React, { useState, useEffect } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface StickyCTAProps {
  element: PageElement;
  children?: React.ReactNode;
}

export function StickyCTA({ element, children }: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerScrollPercent = element.content.triggerScrollPercent || 30;
  const position = element.content.position || 'bottom';
  const dismissible = element.content.dismissible !== false;
  const [isDismissed, setIsDismissed] = useState(false);
  const animation = element.content.animation || 'slide';
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercent >= triggerScrollPercent && !isDismissed);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [triggerScrollPercent, isDismissed]);

  if (!isVisible) return null;

  const baseStyle: React.CSSProperties = {
    position: 'fixed',
    [position]: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: '16px 24px',
    backgroundColor: 'var(--page-surface, #171717)',
    borderTop: position === 'bottom' ? '1px solid var(--page-border, #262626)' : 'none',
    borderBottom: position === 'top' ? '1px solid var(--page-border, #262626)' : 'none',
    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    ...(animation === 'slide' && {
      animation: position === 'bottom' ? 'slideUp 0.3s ease' : 'slideDown 0.3s ease',
    }),
    ...(animation === 'fade' && {
      animation: 'fadeIn 0.3s ease',
    }),
    ...(element.style as React.CSSProperties),
  };

  return (
    <div
      style={baseStyle}
      className="sticky-cta-component"
      role="banner"
      aria-label="Call to action"
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div style={{ flex: 1 }}>
        {children || (
          <>
            <div style={{ fontWeight: '600', color: 'var(--page-text, #fafafa)', marginBottom: '4px' }}>
              {element.content.heading || 'Ready to get started?'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--page-text, #a3a3a3)' }}>
              {element.content.text || 'Join thousands of satisfied customers today.'}
            </div>
          </>
        )}
      </div>
      {element.content.buttonText && (
        <a
          href={element.content.buttonHref || '#'}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--page-primary, #6366f1)',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            whiteSpace: 'nowrap',
          }}
        >
          {element.content.buttonText}
        </a>
      )}
      {dismissible && (
        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--page-text, #737373)',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '4px',
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface ButtonProps {
  element: PageElement;
}

export function Button({ element }: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const href = element.content.href;
  const variant = element.content.variant || 'primary';
  const size = element.content.size || 'medium';
  const disabled = element.content.disabled || false;
  
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '600',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    borderRadius: '8px',
    ...(element.style as React.CSSProperties),
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--page-primary, #6366f1)',
      color: '#ffffff',
      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
    },
    secondary: {
      backgroundColor: 'var(--page-secondary, #10b981)',
      color: '#ffffff',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--page-primary, #6366f1)',
      border: '2px solid var(--page-primary, #6366f1)',
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--page-text, #fafafa)',
      boxShadow: 'none',
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      padding: '8px 16px',
      fontSize: '14px',
    },
    medium: {
      padding: '12px 24px',
      fontSize: '16px',
    },
    large: {
      padding: '16px 32px',
      fontSize: '18px',
    },
  };

  const combinedStyle: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    opacity: disabled ? 0.6 : 1,
  };

  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    if (element.content.onClick === 'loading') {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  const buttonContent = (
    <button
      style={combinedStyle}
      onClick={handleClick}
      disabled={disabled || isLoading}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = variant === 'outline' || variant === 'ghost' 
            ? 'none' 
            : '0 4px 12px rgba(99, 102, 241, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow || 'none';
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid var(--page-primary, #6366f1)';
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      aria-label={element.content.ariaLabel || element.content.text || 'Button'}
      aria-disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
            aria-hidden="true"
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          {element.content.loadingText || 'Loading...'}
        </>
      ) : (
        element.content.text || 'Click me'
      )}
    </button>
  );

  if (href && href !== '#') {
    return (
      <a
        href={href}
        target={element.content.target || '_self'}
        rel={element.content.target === '_blank' ? 'noopener noreferrer' : undefined}
        style={combinedStyle}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = variant === 'outline' || variant === 'ghost' 
              ? 'none' 
              : '0 4px 12px rgba(99, 102, 241, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow || 'none';
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = '2px solid var(--page-primary, #6366f1)';
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
        aria-label={element.content.ariaLabel || element.content.text || 'Button link'}
      >
        {element.content.text || 'Click me'}
      </a>
    );
  }

  return buttonContent;
}

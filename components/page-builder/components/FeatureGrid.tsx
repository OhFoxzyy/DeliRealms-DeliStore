import React from 'react';
import type { PageElement } from '@/lib/page-builder/types';
import { Container } from './Container';
import { Card } from './Card';

interface FeatureGridProps {
  element: PageElement;
}

export function FeatureGrid({ element }: FeatureGridProps) {
  const features = element.content.features || [];
  const columns = element.content.columns || 3;
  
  const baseStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '24px',
    ...(element.style as React.CSSProperties),
  };

  const mobileStyle: React.CSSProperties = {
    ...baseStyle,
    gridTemplateColumns: '1fr',
    gap: '16px',
  };

  return (
    <div
      style={baseStyle}
      className="feature-grid"
      role="region"
      aria-label="Features"
    >
      <style>{`
        @media (max-width: 768px) {
          .feature-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .feature-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
      {features.map((feature: any, index: number) => {
        const cardElement: PageElement = {
          id: `${element.id}-card-${index}`,
          type: 'card',
          content: {
            title: feature.title || `Feature ${index + 1}`,
            description: feature.description || 'Feature description',
          },
          style: {
            padding: '24px',
            backgroundColor: 'var(--page-surface, #171717)',
            borderRadius: '8px',
            border: '1px solid var(--page-border, #262626)',
            transition: 'all 0.3s ease',
            height: '100%',
          },
        };
        
        return (
          <div
            key={index}
            style={{
              padding: '24px',
              backgroundColor: 'var(--page-surface, #171717)',
              borderRadius: '8px',
              border: '1px solid var(--page-border, #262626)',
              transition: 'all 0.3s ease',
              height: '100%',
            }}
            className="feature-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.borderColor = 'var(--page-primary, #6366f1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--page-border, #262626)';
            }}
            role="article"
            aria-labelledby={`feature-title-${index}`}
          >
            <h3
              id={`feature-title-${index}`}
              style={{
                fontSize: 'clamp(18px, 2vw, 20px)',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--page-text, #fafafa)',
                lineHeight: '1.4',
              }}
            >
              {feature.title || `Feature ${index + 1}`}
            </h3>
            <p
              style={{
                color: 'var(--page-text, #a3a3a3)',
                fontSize: 'clamp(14px, 1.5vw, 16px)',
                lineHeight: '1.6',
                margin: 0,
              }}
            >
              {feature.description || 'Feature description'}
            </p>
          </div>
        );
      })}
    </div>
  );
}

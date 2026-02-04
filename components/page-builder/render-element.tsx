"use client";

import { usePageBuilder } from './page-builder-context';
import type { PageElement } from '@/lib/page-builder/types';
import { cn } from '@/lib/utils';

interface RenderElementProps {
  element: PageElement;
}

export function RenderElement({ element }: RenderElementProps) {
  const { selectElement, selectedElement } = usePageBuilder();
  const isSelected = selectedElement?.id === element.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element);
  };

  const renderContent = () => {
    switch (element.type) {
      case 'container':
        return (
          <div style={element.style}>
            {element.children?.map((child) => (
              <RenderElement key={child.id} element={child} />
            ))}
          </div>
        );

      case 'heading':
        return <h1 style={element.style}>{element.content.text}</h1>;

      case 'text':
        return <p style={element.style}>{element.content.text}</p>;

      case 'button':
        return (
          <button style={element.style}>
            {element.content.text}
          </button>
        );

      case 'image':
        return (
          <img
            src={element.content.src}
            alt={element.content.alt || ''}
            style={element.style}
          />
        );

      case 'video':
        return element.content.src ? (
          <video src={element.content.src} controls style={element.style} />
        ) : (
          <div style={{ ...element.style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', minHeight: '200px' }}>
            <span className="text-muted-foreground">Video placeholder</span>
          </div>
        );

      case 'link':
        return (
          <a
            href={element.content.href}
            target={element.content.target}
            style={element.style}
          >
            {element.content.text}
          </a>
        );

      case 'divider':
        return <hr style={element.style} />;

      case 'hero':
        return (
          <div style={element.style}>
            <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>
              {element.content.heading}
            </h1>
            <p style={{ fontSize: '20px', marginBottom: '32px', color: '#6b7280' }}>
              {element.content.subheading}
            </p>
            <button
              style={{
                padding: '12px 32px',
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {element.content.buttonText}
            </button>
          </div>
        );

      case 'pricing-card':
        return (
          <div style={element.style}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
              {element.content.title}
            </h3>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '48px', fontWeight: '700' }}>
                {element.content.price}
              </span>
              <span style={{ fontSize: '16px', color: '#6b7280' }}>
                {element.content.period}
              </span>
            </div>
            <ul style={{ textAlign: 'left', marginBottom: '24px', listStyle: 'none', padding: 0 }}>
              {element.content.features?.map((feature: string, index: number) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  ✓ {feature}
                </li>
              ))}
            </ul>
            <button
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {element.content.buttonText}
            </button>
          </div>
        );

      case 'checkout':
        return (
          <button style={element.style}>
            {element.content.text}
          </button>
        );

      case 'feature-grid':
        return (
          <div style={element.style}>
            {element.content.features?.map((feature: any, index: number) => (
              <div
                key={index}
                style={{
                  padding: '24px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#6b7280' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        );

      default:
        return <div style={element.style}>Unknown element type</div>;
    }
  };

  return (
    <div
      onClick={handleClick}
      data-element-id={element.id}
      className={cn(
        'relative',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2'
      )}
    >
      {renderContent()}
    </div>
  );
}

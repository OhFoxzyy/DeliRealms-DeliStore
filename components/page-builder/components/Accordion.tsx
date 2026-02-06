import React, { useState } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface AccordionProps {
  element: PageElement;
}

export function Accordion({ element }: AccordionProps) {
  const items = element.content.items || [];
  const allowMultiple = element.content.allowMultiple || false;
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  
  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(index);
      }
      return next;
    });
  };

  const baseStyle: React.CSSProperties = {
    width: '100%',
    ...(element.style as React.CSSProperties),
  };

  return (
    <div
      style={baseStyle}
      className="accordion-component"
      role="region"
      aria-label={element.content.ariaLabel || 'Accordion'}
    >
      {items.map((item: any, index: number) => {
        const isOpen = openItems.has(index);
        return (
          <div
            key={index}
            style={{
              border: '1px solid var(--page-border, #262626)',
              borderRadius: '8px',
              marginBottom: '8px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => toggleItem(index)}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: 'var(--page-surface, #171717)',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'var(--page-text, #fafafa)',
                fontSize: '16px',
                fontWeight: '600',
              }}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${index}`}
            >
              <span>{item.title || `Item ${index + 1}`}</span>
              <span style={{ transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </button>
            {isOpen && (
              <div
                id={`accordion-content-${index}`}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--page-background, #0a0a0a)',
                  color: 'var(--page-text, #a3a3a3)',
                }}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

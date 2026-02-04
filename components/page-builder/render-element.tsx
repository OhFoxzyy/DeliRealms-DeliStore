"use client";

import React from 'react';
import { usePageBuilder } from './page-builder-context';
import { DropZone } from './drop-zone';
import type { PageElement } from '@/lib/page-builder/types';
import { cn } from '@/lib/utils';
import { Copy, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';

interface RenderElementProps {
  element: PageElement;
  parentId?: string | null;
  siblingIndex?: number;
  createDropHandler?: (parentId: string | null, index: number) => (e: React.DragEvent) => void;
}

export function RenderElement({ element, parentId, siblingIndex = 0, createDropHandler }: RenderElementProps) {
  const { selectElement, selectedElement, duplicateElement, deleteElement, moveElement, addElementAt } = usePageBuilder();
  const isSelected = selectedElement?.id === element.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element);
  };

  const renderContent = () => {
    switch (element.type) {
      case 'container':
        const children = element.children || [];
        if (!createDropHandler) {
          return (
            <div style={element.style}>
              {children.map((child) => (
                <RenderElement key={child.id} element={child} />
              ))}
            </div>
          );
        }
        return (
          <div style={element.style} className="min-h-[60px] flex flex-col">
            {children.map((child, idx) => (
              <React.Fragment key={child.id}>
                <DropZone
                  onDrop={createDropHandler(element.id, idx)}
                  parentId={element.id}
                  index={idx}
                  className="min-h-[20px]"
                />
                <RenderElement
                  element={child}
                  parentId={element.id}
                  siblingIndex={idx}
                  createDropHandler={createDropHandler}
                />
              </React.Fragment>
            ))}
            <DropZone
              onDrop={createDropHandler(element.id, children.length)}
              parentId={element.id}
              index={children.length}
              className="min-h-[20px] flex-1"
            />
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
          <div style={{ ...element.style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--muted)', minHeight: '200px' }}>
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
            <p style={{ fontSize: '20px', marginBottom: '32px', color: 'var(--muted-foreground)' }}>
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
              <span style={{ fontSize: '16px', color: 'var(--muted-foreground)' }}>
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
                  backgroundColor: 'var(--muted)',
                  borderRadius: '8px',
                }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--muted-foreground)' }}>{feature.description}</p>
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
        'relative group',
        isSelected && 'ring-2 ring-white ring-offset-2'
      )}
    >
      {isSelected && (
        <div className="absolute -top-10 left-0 right-0 flex justify-center z-10">
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); moveElement(element.id, 'up'); }}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); moveElement(element.id, 'down'); }}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); duplicateElement(element.id); }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
      {renderContent()}
    </div>
  );
}

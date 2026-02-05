"use client";

import React, { type CSSProperties } from 'react';
import { usePageBuilder } from './page-builder-context';
import { DropZone } from './drop-zone';
import type { PageElement, ElementStyle } from '@/lib/page-builder/types';
import { cn } from '@/lib/utils';
import { Copy, Trash2, ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '../ui/button';
import { componentsMap } from './components';

interface RenderElementProps {
  element: PageElement;
  parentId?: string | null;
  siblingIndex?: number;
  createDropHandler?: (parentId: string | null, index: number) => (e: React.DragEvent) => void;
}

function computeStyle(style: ElementStyle | undefined): CSSProperties | undefined {
  if (!style) return undefined;
  const computed: any = { ...style };
  if (style.backgroundGradient) {
    computed.backgroundImage = style.backgroundGradient;
  }
  delete computed.backgroundGradient;
  return computed;
}

export function RenderElement({ element, parentId, siblingIndex = 0, createDropHandler }: RenderElementProps) {
  const { selectElement, selectedElement, duplicateElement, deleteElement, moveElement, updateElement } = usePageBuilder();
  const isSelected = selectedElement?.id === element.id;
  
  const textLikeTypes = ['heading', 'text', 'button', 'hero', 'pricing-card', 'feature-grid'];
  const isTextLike = textLikeTypes.includes(element.type);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element);
  };

  const renderContent = () => {
<<<<<<< HEAD
    switch (element.type) {
      case 'container':
        const children = element.children || [];
        if (!createDropHandler) {
          return (
            <div style={computeStyle(element.style)}>
              {children.map((child) => (
                <RenderElement key={child.id} element={child} />
              ))}
            </div>
          );
        }
        return (
          <div style={computeStyle(element.style)} className="min-h-[60px] flex flex-col">
            {children.map((child, idx) => (
              <React.Fragment key={child.id}>
                <DropZone
                  onDrop={createDropHandler(element.id, idx)}
                  parentId={element.id}
                  index={idx}
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
              className="flex-1"
            />
          </div>
        );

      case 'heading':
        return <h1 style={computeStyle(element.style)}>{element.content.text}</h1>;

      case 'text':
        return <p style={computeStyle(element.style)}>{element.content.text}</p>;

      case 'button':
        return (
          <button style={computeStyle(element.style)}>
            {element.content.text}
          </button>
        );

      case 'image':
        return (
          <img
            src={element.content.src}
            alt={element.content.alt || ''}
            style={computeStyle(element.style)}
          />
        );

      case 'video':
        return element.content.src ? (
          <video src={element.content.src} controls style={computeStyle(element.style)} />
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
            style={computeStyle(element.style)}
          >
            {element.content.text}
          </a>
        );

      case 'divider':
        return <hr style={computeStyle(element.style)} />;

      case 'hero':
        return (
          <div style={computeStyle(element.style)}>
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
          <div style={computeStyle(element.style)}>
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
          <button style={computeStyle(element.style)}>
            {element.content.text}
          </button>
        );

      case 'feature-grid':
        return (
          <div style={computeStyle(element.style)}>
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
=======
    const componentDef = componentsMap[element.type];
    
    if (!componentDef) {
      return <div style={element.style as React.CSSProperties}>Unknown element type: {element.type}</div>;
>>>>>>> c9965df20fa6fc21eb504d0fc60fd71845236cf7
    }

    const { Component } = componentDef;
    const children = element.children || [];
    
    // Handle container-like components that can have children
    const containerTypes = ['container', 'card', 'section', 'grid', 'column', 'form'];
    const isContainer = containerTypes.includes(element.type);

    if (isContainer) {
      if (!createDropHandler) {
        return (
          <Component element={element}>
            {children.map((child) => (
              <RenderElement key={child.id} element={child} />
            ))}
          </Component>
        );
      }
      
      return (
        <Component element={element}>
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
        </Component>
      );
    }

    // For non-container components, render directly
    return <Component element={element} />;
  };

  return (
    <div
      onClick={handleClick}
      data-element-id={element.id}
      className={cn(
        'relative group transition-all',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {isSelected && (
<<<<<<< HEAD
        <div className="absolute -top-10 left-0 right-0 flex justify-center z-10">
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg p-1">
            {isTextLike && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-7 w-7", element.style.textAlign === 'left' && "bg-accent")}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateElement(element.id, { style: { ...element.style, textAlign: 'left' } });
                  }}
                  title="Align left"
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-7 w-7", element.style.textAlign === 'center' && "bg-accent")}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateElement(element.id, { style: { ...element.style, textAlign: 'center' } });
                  }}
                  title="Align center"
                >
                  <AlignCenter className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-7 w-7", element.style.textAlign === 'right' && "bg-accent")}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateElement(element.id, { style: { ...element.style, textAlign: 'right' } });
                  }}
                  title="Align right"
                >
                  <AlignRight className="h-3.5 w-3.5" />
                </Button>
                <div className="h-4 w-px bg-border mx-0.5" />
              </>
            )}
=======
        <div className="absolute -top-12 left-0 right-0 flex justify-center z-10">
          <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border/80 rounded-lg shadow-xl p-1.5">
>>>>>>> c9965df20fa6fc21eb504d0fc60fd71845236cf7
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={(e) => { e.stopPropagation(); moveElement(element.id, 'up'); }}
              title="Move up"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={(e) => { e.stopPropagation(); moveElement(element.id, 'down'); }}
              title="Move down"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={(e) => { e.stopPropagation(); duplicateElement(element.id); }}
              title="Duplicate"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
              title="Delete"
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

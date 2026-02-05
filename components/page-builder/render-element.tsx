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
    const componentDef = componentsMap[element.type];
    if (!componentDef) {
      return <div style={element.style as React.CSSProperties}>Unknown element type: {element.type}</div>;
    }

    const { Component } = componentDef;
    const children = element.children || [];
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
        <div className="absolute -top-12 left-0 right-0 flex justify-center z-10">
          <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border/80 rounded-lg shadow-xl p-1.5">
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

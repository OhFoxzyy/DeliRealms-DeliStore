"use client";

import React from 'react';
import { usePageBuilder } from './page-builder-context';
import { DropZone } from './drop-zone';
import type { PageElement } from '@/lib/page-builder/types';
import { cn } from '@/lib/utils';
import { Copy, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { componentsMap } from './components';

interface RenderElementProps {
  element: PageElement;
  parentId?: string | null;
  siblingIndex?: number;
  createDropHandler?: (parentId: string | null, index: number) => (e: React.DragEvent) => void;
}

export function RenderElement({ element, parentId, siblingIndex = 0, createDropHandler }: RenderElementProps) {
  const { selectElement, selectedElement, duplicateElement, deleteElement, moveElement } = usePageBuilder();
  const isSelected = selectedElement?.id === element.id;

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
        <div className="absolute -top-12 left-0 right-0 flex justify-center z-10">
          <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border/80 rounded-lg shadow-xl p-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={(e) => { e.stopPropagation(); moveElement(element.id, 'up'); }}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={(e) => { e.stopPropagation(); moveElement(element.id, 'down'); }}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={(e) => { e.stopPropagation(); duplicateElement(element.id); }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
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

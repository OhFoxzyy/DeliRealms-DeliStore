"use client";

import React from 'react';
import { usePageBuilder } from './page-builder-context';
import { RenderElement } from './render-element';
import { DropZone } from './drop-zone';
import type { PageElement } from '@/lib/page-builder/types';
import { componentLibrary } from './component-library';
import { cn } from '@/lib/utils';

interface BuilderCanvasProps {
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

function createElementFromDrag(componentData: string): PageElement | null {
  const component = JSON.parse(componentData);
  const componentDef = componentLibrary.find((c) => c.type === component.type);
  if (!componentDef) return null;
  return {
    id: `${component.type}-${Date.now()}`,
    type: component.type,
    content: { ...componentDef.defaultContent },
    style: { ...componentDef.defaultStyle },
    children: component.type === 'container' ? [] : undefined,
  };
}

export function BuilderCanvas({ viewMode = 'desktop' }: BuilderCanvasProps) {
  const { elements, addElement, addElementAt, theme } = usePageBuilder();
  const [isDraggingOverEmpty, setIsDraggingOverEmpty] = React.useState(false);

  const createDropHandler = (parentId: string | null, index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const componentData = e.dataTransfer.getData('component');
    if (!componentData) return;
    const newElement = createElementFromDrag(componentData);
    if (newElement) addElementAt(newElement, parentId, index);
  };

  const handleDrop = createDropHandler(null, elements.length);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (elements.length === 0) {
      setIsDraggingOverEmpty(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    // Only set false if we're leaving the canvas area entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDraggingOverEmpty(false);
    }
  };

  const canvasWidth = {
    desktop: 'w-full max-w-6xl',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  // Inject theme CSS variables
  const themeVars = theme ? {
    '--page-primary': theme.palette.primary,
    '--page-secondary': theme.palette.secondary,
    '--page-accent': theme.palette.accent,
    '--page-background': theme.palette.background,
    '--page-surface': theme.palette.surface,
    '--page-text': theme.palette.text,
  } as React.CSSProperties : {};

  return (
    <div
<<<<<<< HEAD
      className="flex-1 overflow-auto bg-[#111111] p-6 flex justify-center scrollbar-none"
      onDrop={(e) => { handleDrop(e); setIsDraggingOverEmpty(false); }}
=======
      className="flex-1 overflow-auto bg-[#0a0a0a] p-6 flex justify-center"
      onDrop={handleDrop}
>>>>>>> c9965df20fa6fc21eb504d0fc60fd71845236cf7
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div
        className={cn(
<<<<<<< HEAD
          'transition-all duration-300 bg-background rounded-lg shadow-2xl min-h-[800px] border-2 border-border/40 relative',
=======
          'transition-all duration-300 bg-background rounded-xl shadow-2xl min-h-[800px] border border-border/50 backdrop-blur-sm',
>>>>>>> c9965df20fa6fc21eb504d0fc60fd71845236cf7
          canvasWidth[viewMode]
        )}
        style={{
          ...themeVars,
          backgroundColor: theme?.palette.background || undefined,
        }}
      >
<<<<<<< HEAD
        {/* Inner page wrapper with overflow constraints */}
        <div className="overflow-x-hidden overflow-y-auto h-full max-h-[calc(100vh-200px)] scrollbar-none">
          {elements.length === 0 ? (
            <div className={cn(
              "flex items-center justify-center h-[800px] text-center border-2 border-dashed rounded-lg m-4 transition-all",
              isDraggingOverEmpty 
                ? "border-accent bg-accent/10" 
                : "border-border/50"
            )}>
              <div>
                <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className={cn(
                  "text-lg font-medium mb-2 transition-colors",
                  isDraggingOverEmpty ? "text-foreground" : "text-muted-foreground"
                )}>
                  {isDraggingOverEmpty ? "Drop here to add component" : "Drop components here to start building"}
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Drag components from the right panel onto this canvas to create your page
                </p>
              </div>
=======
        {elements.length === 0 ? (
          <div className="flex items-center justify-center h-[800px] text-center border-2 border-dashed border-border/60 rounded-xl m-4 bg-muted/5 hover:bg-muted/10 transition-colors">
            <div>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-foreground text-lg font-medium mb-2">
                Drop components here to start building
              </p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Drag components from the right panel onto this canvas to create your page
              </p>
>>>>>>> c9965df20fa6fc21eb504d0fc60fd71845236cf7
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-0">
              {elements.map((element, index) => (
                <div key={element.id} className="contents">
                  <DropZone
                    onDrop={createDropHandler(null, index)}
                    parentId={null}
                    index={index}
                  />
                  <RenderElement element={element} parentId={null} siblingIndex={index} createDropHandler={createDropHandler} />
                </div>
              ))}
              <DropZone
                onDrop={createDropHandler(null, elements.length)}
                parentId={null}
                index={elements.length}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

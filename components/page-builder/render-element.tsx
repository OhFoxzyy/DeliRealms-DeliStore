"use client";

import React, { useRef, useCallback, type CSSProperties } from 'react';
import { usePageBuilder } from './page-builder-context';
import { DropZone } from './drop-zone';
import type { PageElement, ElementStyle } from '@/lib/page-builder/types';
import { cn } from '@/lib/utils';
import { Copy, Trash2, ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight, Move, ArrowUpToLine, ArrowDownToLine, ClipboardCopy, ClipboardPaste, Box, Layout } from 'lucide-react';
import { Button } from '../ui/button';
import { componentsMap } from './components';

interface RenderElementProps {
  element: PageElement;
  parentId?: string | null;
  siblingIndex?: number;
  createDropHandler?: (parentId: string | null, index: number) => (e: React.DragEvent) => void;
}

function computeStyle(
  style: ElementStyle | undefined,
  breakpoints?: Record<string, ElementStyle>,
  viewMode?: 'desktop' | 'tablet' | 'mobile'
): CSSProperties | undefined {
  if (!style) return undefined;
  
  // Apply breakpoint-specific styles
  let computed: any = { ...style };
  
  if (breakpoints && viewMode) {
    const breakpointStyle = breakpoints[viewMode];
    if (breakpointStyle) {
      computed = { ...computed, ...breakpointStyle };
    }
  }
  
  if (computed.backgroundGradient) {
    computed.backgroundImage = computed.backgroundGradient;
  }
  delete computed.backgroundGradient;
  
  return computed;
}

function applyInteractionStyles(
  element: PageElement,
  baseStyle: CSSProperties
): { style: CSSProperties; className: string } {
  const interactions = element.content?.interactions || {};
  const className = element.tailwindClasses || '';
  
  // Apply hover styles via CSS variables
  const hoverStyles = interactions.hover || {};
  const activeStyles = interactions.active || {};
  const focusStyles = interactions.focus || {};
  
  const cssOverrides = element.cssOverrides || '';
  
  return {
    style: baseStyle,
    className: className,
  };
}

export function RenderElement({ element, parentId, siblingIndex = 0, createDropHandler }: RenderElementProps) {
  const { selectElement, selectedElement, duplicateElement, deleteElement, moveElement, updateElement, moveElementToTop, moveElementToBottom, copyStyle, pasteStyle, wrapInContainer, convertToSection, copiedStyle, viewMode } = usePageBuilder();
  const isSelected = selectedElement?.id === element.id;
  const positionDragRef = useRef(false);
  const isFreePosition = element.style?.position === 'absolute';
  
  // Apply styles with breakpoints and overrides
  const baseStyle = computeStyle(element.style, element.breakpoints, viewMode);
  const { style: finalStyle, className: finalClassName } = applyInteractionStyles(element, baseStyle || {});
  
  // Inject CSS overrides if present
  const cssId = `element-${element.id}`;
  React.useEffect(() => {
    if (element.cssOverrides) {
      const styleEl = document.getElementById(cssId) || document.createElement('style');
      styleEl.id = cssId;
      styleEl.textContent = `.${cssId} { ${element.cssOverrides} }`;
      if (!document.getElementById(cssId)) {
        document.head.appendChild(styleEl);
      }
    }
    return () => {
      const styleEl = document.getElementById(cssId);
      if (styleEl) styleEl.remove();
    };
  }, [element.cssOverrides, cssId]);

  const textLikeTypes = ['heading', 'text', 'button', 'hero', 'pricing-card', 'feature-grid'];
  const isTextLike = textLikeTypes.includes(element.type);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (positionDragRef.current) {
      positionDragRef.current = false;
      return;
    }
    selectElement(element);
  };

  const handlePositionDrag = useCallback(
    (e: React.MouseEvent) => {
      if (!isFreePosition || !element.style) return;
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = parseFloat(String(element.style.left || 0)) || 0;
      const startTop = parseFloat(String(element.style.top || 0)) || 0;
      const onMove = (e: MouseEvent) => {
        positionDragRef.current = true;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        updateElement(element.id, {
          style: {
            ...element.style,
            left: `${startLeft + dx}px`,
            top: `${startTop + dy}px`,
          },
        });
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [element.id, element.style, isFreePosition, updateElement]
  );

  const renderContent = () => {
    const componentDef = componentsMap[element.type];
    if (!componentDef) {
      return <div style={element.style as React.CSSProperties}>Unknown element type: {element.type}</div>;
    }

    const { Component } = componentDef;
    const children = element.children || [];
    const containerTypes = ['container', 'container-narrow', 'card', 'section', 'section-fullbleed', 'section-contained', 'grid', 'column', 'form', 'stack', 'box', 'flex', 'center', 'split-screen', 'sidebar', 'masonry', 'overlay'];
    const isContainer = containerTypes.includes(element.type);
    
    // Create element with updated style
    const elementWithStyle = {
      ...element,
      style: finalStyle,
      className: cn(element.className, finalClassName, cssId),
    };

    if (isContainer) {
      if (!createDropHandler) {
        return (
          <Component element={elementWithStyle}>
            {children.map((child) => (
              <RenderElement key={child.id} element={child} />
            ))}
          </Component>
        );
      }

      return (
        <Component element={elementWithStyle}>
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

    return <Component element={elementWithStyle} />;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('element-id', element.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const wrapperStyle: React.CSSProperties = isFreePosition
    ? {
        position: 'absolute',
        left: element.style?.left || 0,
        top: element.style?.top || 0,
        zIndex: element.style?.zIndex ? Number(element.style.zIndex) : undefined,
      }
    : {};

  return (
    <div
      onClick={handleClick}
      draggable={!isFreePosition}
      onDragStart={handleDragStart}
      onMouseDown={isFreePosition ? handlePositionDrag : undefined}
      data-element-id={element.id}
      style={wrapperStyle}
      className={cn(
        'group transition-all',
        isFreePosition ? 'cursor-move' : 'cursor-grab active:cursor-grabbing',
        !isFreePosition && 'relative',
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
              onClick={(e) => { e.stopPropagation(); moveElementToTop(element.id); }}
              title="Move to top"
            >
              <ArrowUpToLine className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={(e) => { e.stopPropagation(); moveElementToBottom(element.id); }}
              title="Move to bottom"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={(e) => { e.stopPropagation(); copyStyle(element.id); }}
              title="Copy style"
            >
              <ClipboardCopy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50 disabled:opacity-50"
              onClick={(e) => { e.stopPropagation(); pasteStyle(element.id); }}
              disabled={!copiedStyle}
              title="Paste style"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={(e) => { e.stopPropagation(); wrapInContainer(element.id); }}
              title="Wrap in container"
            >
              <Box className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={(e) => { e.stopPropagation(); convertToSection(element.id); }}
              title="Convert to section"
            >
              <Layout className="h-3.5 w-3.5" />
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
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={(e) => {
                e.stopPropagation();
                updateElement(element.id, {
                  style: {
                    ...element.style,
                    position: isFreePosition ? 'static' : 'absolute',
                    ...(isFreePosition ? {} : { left: '0px', top: '0px' }),
                  },
                });
              }}
              title={isFreePosition ? 'Flow position' : 'Free position'}
            >
              <Move className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
      {renderContent()}
    </div>
  );
}

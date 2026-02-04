"use client";

import { useState } from 'react';
import { usePageBuilder } from './page-builder-context';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Copy, 
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function LayersPanel() {
  const { elements, selectedElementId, selectElement, updateElement, deleteElement, duplicateElement } = usePageBuilder();
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedElements);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedElements(newExpanded);
  };

  const toggleVisibility = (id: string, currentVisibility: boolean) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      updateElement(id, {
        style: {
          ...element.style,
          visibility: currentVisibility ? 'hidden' : 'visible',
        },
      });
    }
  };

  const toggleLock = (_id: string, _currentLock: boolean) => {
    // Locked state not yet implemented in PageElement - no-op
  };

  const renderElement = (element: any, depth: number = 0) => {
    const hasChildren = element.children && element.children.length > 0;
    const isExpanded = expandedElements.has(element.id);
    const isSelected = selectedElementId === element.id;
    const isVisible = (element as { style?: { visibility?: string } }).style?.visibility !== 'hidden';
    const isLocked = false;

    return (
      <div key={element.id}>
        <div
          className={cn(
            "group flex items-center gap-2 px-2 py-1.5 hover:bg-accent/50 cursor-pointer transition-colors",
            isSelected && "bg-accent"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => selectElement(element.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(element.id);
              }}
              className="p-0.5 hover:bg-accent rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />

          <span className="flex-1 text-sm truncate">
            {element.type} {element.content?.text && `- ${element.content.text.substring(0, 20)}`}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(element.id, isVisible);
              }}
              className="p-1 hover:bg-background rounded"
            >
              {isVisible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3 text-muted-foreground" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(element.id, isLocked);
              }}
              className="p-1 hover:bg-background rounded"
            >
              {isLocked ? (
                <Lock className="h-3 w-3" />
              ) : (
                <Unlock className="h-3 w-3 text-muted-foreground" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateElement(element.id);
              }}
              className="p-1 hover:bg-background rounded"
            >
              <Copy className="h-3 w-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(element.id);
              }}
              className="p-1 hover:bg-background rounded"
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {element.children.map((child: any) => renderElement(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r bg-background flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Layers</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {elements.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No elements yet
            </div>
          ) : (
            elements.map(element => renderElement(element))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

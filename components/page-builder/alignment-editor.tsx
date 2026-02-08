"use client";

import React from 'react';
import { usePageBuilder } from './page-builder-context';
import { Button } from '../ui/button';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AlignmentEditor() {
  const { selectedElement, updateElement } = usePageBuilder();

  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-neutral-500 text-sm">
        Select an element to edit alignment
      </div>
    );
  }

  const currentAlign = selectedElement.style?.textAlign || 'left';
  const currentJustify = selectedElement.style?.justifyContent || 'flex-start';
  const currentAlignItems = selectedElement.style?.alignItems || 'stretch';

  const handleTextAlign = (align: string) => {
    updateElement(selectedElement.id, {
      style: {
        ...selectedElement.style,
        textAlign: align,
      },
    });
  };

  const handleJustifyContent = (justify: string) => {
    updateElement(selectedElement.id, {
      style: {
        ...selectedElement.style,
        display: 'flex',
        justifyContent: justify,
      },
    });
  };

  const handleAlignItems = (align: string) => {
    updateElement(selectedElement.id, {
      style: {
        ...selectedElement.style,
        display: 'flex',
        alignItems: align,
      },
    });
  };

  return (
    <div className="p-3 space-y-4">
      <div>
        <label className="text-xs font-medium text-white block mb-2">Text Alignment</label>
        <div className="grid grid-cols-4 gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTextAlign('left')}
            className={cn(
              "h-8 px-2",
              currentAlign === 'left' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white hover:bg-neutral-900"
            )}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTextAlign('center')}
            className={cn(
              "h-8 px-2",
              currentAlign === 'center' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white hover:bg-neutral-900"
            )}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTextAlign('right')}
            className={cn(
              "h-8 px-2",
              currentAlign === 'right' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white hover:bg-neutral-900"
            )}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTextAlign('justify')}
            className={cn(
              "h-8 px-2",
              currentAlign === 'justify' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white hover:bg-neutral-900"
            )}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-white block mb-2">Horizontal Alignment (Flex)</label>
        <div className="grid grid-cols-3 gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleJustifyContent('flex-start')}
            className={cn(
              "h-8 px-2",
              currentJustify === 'flex-start' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white hover:bg-neutral-900"
            )}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleJustifyContent('center')}
            className={cn(
              "h-8 px-2",
              currentJustify === 'center' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white hover:bg-neutral-900"
            )}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleJustifyContent('flex-end')}
            className={cn(
              "h-8 px-2",
              currentJustify === 'flex-end' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white hover:bg-neutral-900"
            )}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-white block mb-2">Vertical Alignment (Flex)</label>
        <div className="grid grid-cols-3 gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAlignItems('flex-start')}
            className={cn(
              "h-8 px-2",
              currentAlignItems === 'flex-start' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white hover:bg-neutral-900"
            )}
          >
            <AlignVerticalJustifyStart className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAlignItems('center')}
            className={cn(
              "h-8 px-2",
              currentAlignItems === 'center' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white hover:bg-neutral-900"
            )}
          >
            <AlignVerticalJustifyCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAlignItems('flex-end')}
            className={cn(
              "h-8 px-2",
              currentAlignItems === 'flex-end' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white hover:bg-neutral-900"
            )}
          >
            <AlignVerticalJustifyEnd className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

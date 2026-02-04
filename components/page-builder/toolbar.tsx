"use client";

import { usePageBuilder } from './page-builder-context';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Undo,
  Redo,
  Copy,
  Clipboard,
  Trash2,
  Save,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Maximize,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type ViewMode = 'mobile' | 'tablet' | 'desktop' | 'fullscreen';

interface ToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
}

export function Toolbar({ onSave, onPreview }: ToolbarProps) {
  const { 
    selectedElementId, 
    deleteElement, 
    duplicateElement,
    undo,
    redo,
    canUndo,
    canRedo,
  } = usePageBuilder();

  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [copiedElement, setCopiedElement] = useState<any>(null);

  const handleCopy = () => {
    const element = document.querySelector(`[data-element-id="${selectedElementId}"]`);
    if (element) {
      setCopiedElement({ id: selectedElementId });
    }
  };

  const handlePaste = () => {
    if (copiedElement && selectedElementId) {
      duplicateElement(copiedElement.id);
    }
  };

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          disabled={!selectedElementId}
          title="Copy"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePaste}
          disabled={!copiedElement}
          title="Paste"
        >
          <Clipboard className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => selectedElementId && deleteElement(selectedElementId)}
          disabled={!selectedElementId}
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1 bg-accent/50 rounded-md p-1">
          <Button
            variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode('mobile')}
            title="Mobile View"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === 'tablet' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode('tablet')}
            title="Tablet View"
          >
            <Tablet className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode('desktop')}
            title="Desktop View"
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === 'fullscreen' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode('fullscreen')}
            title="Fullscreen"
          >
            <Maximize className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button size="sm" onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}

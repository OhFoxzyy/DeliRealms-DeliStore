"use client";

import { useState, useEffect } from 'react';
import { usePageBuilder } from './page-builder-context';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trash2, Copy, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PropertyOnlyEditor() {
  const { selectedElement, updateElement, deleteElement, duplicateElement, copyStyle, pasteStyle } = usePageBuilder();
  const [localContent, setLocalContent] = useState<Record<string, any>>({});
  const [localStyle, setLocalStyle] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedElement) {
      setLocalContent(selectedElement.content || {});
      setLocalStyle(selectedElement.style || {});
    }
  }, [selectedElement]);

  if (!selectedElement) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <Layers className="h-12 w-12 text-neutral-600 mb-4" />
        <p className="text-sm text-neutral-400">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  const handleContentUpdate = (key: string, value: any) => {
    const newContent = { ...localContent, [key]: value };
    setLocalContent(newContent);
    updateElement(selectedElement.id, { content: newContent });
  };

  const handleStyleUpdate = (key: string, value: string) => {
    const newStyle = { ...localStyle, [key]: value };
    setLocalStyle(newStyle);
    updateElement(selectedElement.id, { style: newStyle });
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white capitalize">
            {selectedElement.type.replace('-', ' ')}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-neutral-400 hover:text-white"
              onClick={() => copyStyle(selectedElement.id)}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-neutral-400 hover:text-red-400"
              onClick={() => deleteElement(selectedElement.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="text-[10px] font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded">
          #{selectedElement.id.slice(0, 8)}
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Content Properties */}
        {selectedElement.type === 'heading' && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Text</Label>
              <Input
                value={localContent.text || ''}
                onChange={(e) => handleContentUpdate('text', e.target.value)}
                placeholder="Enter heading text"
                className="bg-neutral-900 border-neutral-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Level</Label>
              <Select
                value={localContent.level || 'h2'}
                onValueChange={(value) => handleContentUpdate('level', value)}
              >
                <SelectTrigger className="bg-neutral-900 border-neutral-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1</SelectItem>
                  <SelectItem value="h2">H2</SelectItem>
                  <SelectItem value="h3">H3</SelectItem>
                  <SelectItem value="h4">H4</SelectItem>
                  <SelectItem value="h5">H5</SelectItem>
                  <SelectItem value="h6">H6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {selectedElement.type === 'text' && (
          <div className="space-y-2">
            <Label className="text-xs text-neutral-400">Content</Label>
            <Textarea
              value={localContent.text || ''}
              onChange={(e) => handleContentUpdate('text', e.target.value)}
              placeholder="Enter text content"
              rows={4}
              className="bg-neutral-900 border-neutral-800 text-white resize-none"
            />
          </div>
        )}

        {selectedElement.type === 'button' && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Label</Label>
              <Input
                value={localContent.label || ''}
                onChange={(e) => handleContentUpdate('label', e.target.value)}
                placeholder="Button text"
                className="bg-neutral-900 border-neutral-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Link</Label>
              <Input
                value={localContent.href || ''}
                onChange={(e) => handleContentUpdate('href', e.target.value)}
                placeholder="https://..."
                className="bg-neutral-900 border-neutral-800 text-white"
              />
            </div>
          </>
        )}

        {selectedElement.type === 'image' && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Image URL</Label>
              <Input
                value={localContent.src || ''}
                onChange={(e) => handleContentUpdate('src', e.target.value)}
                placeholder="https://..."
                className="bg-neutral-900 border-neutral-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Alt Text</Label>
              <Input
                value={localContent.alt || ''}
                onChange={(e) => handleContentUpdate('alt', e.target.value)}
                placeholder="Description"
                className="bg-neutral-900 border-neutral-800 text-white"
              />
            </div>
          </>
        )}

        {/* Style Properties */}
        <div className="pt-4 border-t border-neutral-800">
          <h4 className="text-xs font-semibold text-neutral-400 mb-3">Style</h4>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-neutral-500">Width</Label>
                <Input
                  value={localStyle.width || ''}
                  onChange={(e) => handleStyleUpdate('width', e.target.value)}
                  placeholder="auto"
                  className="bg-neutral-900 border-neutral-800 text-white h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-neutral-500">Height</Label>
                <Input
                  value={localStyle.height || ''}
                  onChange={(e) => handleStyleUpdate('height', e.target.value)}
                  placeholder="auto"
                  className="bg-neutral-900 border-neutral-800 text-white h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-neutral-500">Background</Label>
                <div className="flex gap-1">
                  <Input
                    type="color"
                    value={localStyle.backgroundColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                    className="w-10 h-8 p-1 bg-neutral-900 border-neutral-800"
                  />
                  <Input
                    value={localStyle.backgroundColor || ''}
                    onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                    placeholder="#000000"
                    className="flex-1 bg-neutral-900 border-neutral-800 text-white h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-neutral-500">Text Color</Label>
                <div className="flex gap-1">
                  <Input
                    type="color"
                    value={localStyle.color || '#ffffff'}
                    onChange={(e) => handleStyleUpdate('color', e.target.value)}
                    className="w-10 h-8 p-1 bg-neutral-900 border-neutral-800"
                  />
                  <Input
                    value={localStyle.color || ''}
                    onChange={(e) => handleStyleUpdate('color', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1 bg-neutral-900 border-neutral-800 text-white h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-neutral-500">Padding</Label>
              <Input
                value={localStyle.padding || ''}
                onChange={(e) => handleStyleUpdate('padding', e.target.value)}
                placeholder="0px"
                className="bg-neutral-900 border-neutral-800 text-white h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-neutral-500">Margin</Label>
              <Input
                value={localStyle.margin || ''}
                onChange={(e) => handleStyleUpdate('margin', e.target.value)}
                placeholder="0px"
                className="bg-neutral-900 border-neutral-800 text-white h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-neutral-500">Border Radius</Label>
              <Input
                value={localStyle.borderRadius || ''}
                onChange={(e) => handleStyleUpdate('borderRadius', e.target.value)}
                placeholder="0px"
                className="bg-neutral-900 border-neutral-800 text-white h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-neutral-800">
          <Button
            onClick={() => duplicateElement(selectedElement.id)}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800"
            size="sm"
          >
            Duplicate Element
          </Button>
        </div>
      </div>
    </div>
  );
}

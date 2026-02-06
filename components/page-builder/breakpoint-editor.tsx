"use client";

import React, { useState } from 'react';
import { usePageBuilder } from './page-builder-context';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Monitor, Tablet, Smartphone, X } from 'lucide-react';

const BREAKPOINTS = {
  mobile: { label: 'Mobile', icon: Smartphone, maxWidth: '768px' },
  tablet: { label: 'Tablet', icon: Tablet, maxWidth: '1024px' },
  desktop: { label: 'Desktop', icon: Monitor, minWidth: '1025px' },
};

export function BreakpointEditor() {
  const { selectedElement, updateElement, viewMode } = usePageBuilder();
  const [activeBreakpoint, setActiveBreakpoint] = useState<string>('desktop');

  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-[#737373] text-sm">
        Select an element to edit breakpoints
      </div>
    );
  }

  const breakpoints = selectedElement.breakpoints || {};
  const currentBreakpoint = breakpoints[activeBreakpoint] || {};

  const handleBreakpointStyleChange = (key: string, value: string) => {
    const updated = {
      ...breakpoints,
      [activeBreakpoint]: {
        ...currentBreakpoint,
        [key]: value,
      },
    };
    updateElement(selectedElement.id, {
      breakpoints: updated,
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <h2 className="text-lg font-semibold text-[#fafafa]">Breakpoints</h2>
        <p className="text-xs text-[#737373] mt-1">
          Component-level responsive styles
        </p>
      </div>

      <div className="flex border-b border-[#262626] shrink-0">
        {Object.entries(BREAKPOINTS).map(([key, { label, icon: Icon }]) => (
          <button
            key={key}
            onClick={() => setActiveBreakpoint(key)}
            className={`flex-1 py-2 px-3 text-xs font-medium flex items-center justify-center gap-2 ${
              activeBreakpoint === key
                ? 'bg-[#262626] text-[#fafafa]'
                : 'text-[#737373] hover:bg-[#171717] hover:text-[#e5e5e5]'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          <div className="p-3 rounded-lg bg-[#171717] border border-[#262626]">
            <div className="text-xs text-[#737373] mb-2">
              Styles for {BREAKPOINTS[activeBreakpoint as keyof typeof BREAKPOINTS].label}
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Padding</Label>
                  <Input
                    value={currentBreakpoint.padding || ''}
                    onChange={(e) => handleBreakpointStyleChange('padding', e.target.value)}
                    placeholder="16px"
                    className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Margin</Label>
                  <Input
                    value={currentBreakpoint.margin || ''}
                    onChange={(e) => handleBreakpointStyleChange('margin', e.target.value)}
                    placeholder="0px"
                    className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Font Size</Label>
                <Input
                  value={currentBreakpoint.fontSize || ''}
                  onChange={(e) => handleBreakpointStyleChange('fontSize', e.target.value)}
                  placeholder="16px"
                  className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Display</Label>
                <Select
                  value={currentBreakpoint.display || ''}
                  onValueChange={(value) => handleBreakpointStyleChange('display', value)}
                >
                  <SelectTrigger className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]">
                    <SelectValue placeholder="Inherit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Inherit</SelectItem>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="flex">Flex</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Width</Label>
                  <Input
                    value={currentBreakpoint.width || ''}
                    onChange={(e) => handleBreakpointStyleChange('width', e.target.value)}
                    placeholder="100%"
                    className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max Width</Label>
                  <Input
                    value={currentBreakpoint.maxWidth || ''}
                    onChange={(e) => handleBreakpointStyleChange('maxWidth', e.target.value)}
                    placeholder="auto"
                    className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const updated = { ...breakpoints };
              delete updated[activeBreakpoint];
              updateElement(selectedElement.id, {
                breakpoints: updated,
              });
            }}
            className="w-full border-[#262626] text-[#e5e5e5] hover:bg-[#262626]"
            disabled={!currentBreakpoint || Object.keys(currentBreakpoint).length === 0}
          >
            <X className="h-4 w-4 mr-2" />
            Clear {BREAKPOINTS[activeBreakpoint as keyof typeof BREAKPOINTS].label} Styles
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}

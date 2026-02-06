"use client";

import React, { useState } from 'react';
import { usePageBuilder } from './page-builder-context';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';

export function InteractionEditor() {
  const { selectedElement, updateElement } = usePageBuilder();
  const [activeState, setActiveState] = useState<'hover' | 'active' | 'focus'>('hover');

  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-[#737373] text-sm">
        Select an element to edit interactions
      </div>
    );
  }

  const interactions = selectedElement.content.interactions || {};
  const currentState = interactions[activeState] || {};

  const handleStateChange = (key: string, value: string) => {
    const updated = {
      ...interactions,
      [activeState]: {
        ...currentState,
        [key]: value,
      },
    };
    updateElement(selectedElement.id, {
      content: {
        ...selectedElement.content,
        interactions: updated,
      },
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <h2 className="text-lg font-semibold text-[#fafafa]">Interactions</h2>
        <p className="text-xs text-[#737373] mt-1">
          Edit hover, active, and focus states
        </p>
      </div>

      <Tabs value={activeState} onValueChange={(v) => setActiveState(v as any)} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full grid grid-cols-3 px-4 bg-[#0f0f0f] border-b border-[#262626] shrink-0">
          <TabsTrigger value="hover" className="data-[state=active]:bg-[#171717] data-[state=active]:text-[#fafafa] text-[#737373] text-xs">
            Hover
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-[#171717] data-[state=active]:text-[#fafafa] text-[#737373] text-xs">
            Active
          </TabsTrigger>
          <TabsTrigger value="focus" className="data-[state=active]:bg-[#171717] data-[state=active]:text-[#fafafa] text-[#737373] text-xs">
            Focus
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 min-h-0">
          <TabsContent value={activeState} className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={currentState.backgroundColor || '#6366f1'}
                    onChange={(e) => handleStateChange('backgroundColor', e.target.value)}
                    className="w-12 h-8 p-1 bg-[#0f0f0f] border-[#262626] cursor-pointer"
                  />
                  <Input
                    value={currentState.backgroundColor || ''}
                    onChange={(e) => handleStateChange('backgroundColor', e.target.value)}
                    placeholder="#6366f1"
                    className="flex-1 h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={currentState.color || '#ffffff'}
                    onChange={(e) => handleStateChange('color', e.target.value)}
                    className="w-12 h-8 p-1 bg-[#0f0f0f] border-[#262626] cursor-pointer"
                  />
                  <Input
                    value={currentState.color || ''}
                    onChange={(e) => handleStateChange('color', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1 h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Transform</Label>
                <Input
                  value={currentState.transform || ''}
                  onChange={(e) => handleStateChange('transform', e.target.value)}
                  placeholder="translateY(-2px)"
                  className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Box Shadow</Label>
                <Input
                  value={currentState.boxShadow || ''}
                  onChange={(e) => handleStateChange('boxShadow', e.target.value)}
                  placeholder="0 4px 12px rgba(0,0,0,0.15)"
                  className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={currentState.borderColor || '#262626'}
                    onChange={(e) => handleStateChange('borderColor', e.target.value)}
                    className="w-12 h-8 p-1 bg-[#0f0f0f] border-[#262626] cursor-pointer"
                  />
                  <Input
                    value={currentState.borderColor || ''}
                    onChange={(e) => handleStateChange('borderColor', e.target.value)}
                    placeholder="#262626"
                    className="flex-1 h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Transition</Label>
                <Input
                  value={currentState.transition || ''}
                  onChange={(e) => handleStateChange('transition', e.target.value)}
                  placeholder="all 0.3s ease"
                  className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                />
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

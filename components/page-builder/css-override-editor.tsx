"use client";

import React, { useState } from 'react';
import { usePageBuilder } from './page-builder-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

export function CssOverrideEditor() {
  const { selectedElement, updateElement } = usePageBuilder();
  const [cssOverrides, setCssOverrides] = useState(selectedElement?.cssOverrides || '');
  const [tailwindClasses, setTailwindClasses] = useState(selectedElement?.tailwindClasses || '');

  if (!selectedElement) {
    return (
      <div className="p-4 text-center text-[#737373] text-sm">
        Select an element to edit CSS overrides
      </div>
    );
  }

  const handleCssChange = (value: string) => {
    setCssOverrides(value);
    updateElement(selectedElement.id, {
      cssOverrides: value,
    });
  };

  const handleTailwindChange = (value: string) => {
    setTailwindClasses(value);
    updateElement(selectedElement.id, {
      tailwindClasses: value,
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <h2 className="text-lg font-semibold text-[#fafafa]">CSS Overrides</h2>
        <p className="text-xs text-[#737373] mt-1">
          Add custom CSS or Tailwind classes
        </p>
      </div>

      <Tabs defaultValue="css" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full grid grid-cols-2 px-4 bg-[#0f0f0f] border-b border-[#262626] shrink-0">
          <TabsTrigger value="css" className="data-[state=active]:bg-[#171717] data-[state=active]:text-[#fafafa] text-[#737373]">
            CSS
          </TabsTrigger>
          <TabsTrigger value="tailwind" className="data-[state=active]:bg-[#171717] data-[state=active]:text-[#fafafa] text-[#737373]">
            Tailwind
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 min-h-0">
          <TabsContent value="css" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Custom CSS</Label>
              <Textarea
                value={cssOverrides}
                onChange={(e) => handleCssChange(e.target.value)}
                placeholder=".my-class {&#10;  color: red;&#10;}"
                rows={12}
                className="font-mono text-sm bg-[#171717] border-[#262626] text-[#e5e5e5]"
              />
              <p className="text-xs text-[#737373]">
                CSS will be scoped to this component
              </p>
            </div>
          </TabsContent>

          <TabsContent value="tailwind" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Tailwind Classes</Label>
              <Input
                value={tailwindClasses}
                onChange={(e) => handleTailwindChange(e.target.value)}
                placeholder="bg-blue-500 text-white p-4 rounded-lg"
                className="bg-[#171717] border-[#262626] text-[#e5e5e5]"
              />
              <p className="text-xs text-[#737373]">
                Add Tailwind utility classes separated by spaces
              </p>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

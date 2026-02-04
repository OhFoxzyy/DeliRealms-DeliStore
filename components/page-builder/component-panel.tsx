"use client";

import { useState } from 'react';
import { componentLibrary, type ComponentDefinition } from './component-library';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { usePageBuilder } from './page-builder-context';
import type { PageElement } from '@/lib/page-builder/types';

export function ComponentPanel() {
  const { addElement } = usePageBuilder();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'layout' | 'elements' | 'ecommerce'>('all');

  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredComponents = selectedCategory === 'all'
    ? componentLibrary
    : componentLibrary.filter(c => c.category === selectedCategory);

  return (
    <div className="w-80 border-l bg-background h-full overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Components</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Drag and drop components onto the canvas
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-4 px-4">
          <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>
            All
          </TabsTrigger>
          <TabsTrigger value="layout" onClick={() => setSelectedCategory('layout')}>
            Layout
          </TabsTrigger>
          <TabsTrigger value="elements" onClick={() => setSelectedCategory('elements')}>
            Elements
          </TabsTrigger>
          <TabsTrigger value="ecommerce" onClick={() => setSelectedCategory('ecommerce')}>
            Shop
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="p-4 space-y-2">
          <ComponentGrid components={filteredComponents} onDragStart={handleDragStart} />
        </TabsContent>
        <TabsContent value="layout" className="p-4 space-y-2">
          <ComponentGrid components={filteredComponents} onDragStart={handleDragStart} />
        </TabsContent>
        <TabsContent value="elements" className="p-4 space-y-2">
          <ComponentGrid components={filteredComponents} onDragStart={handleDragStart} />
        </TabsContent>
        <TabsContent value="ecommerce" className="p-4 space-y-2">
          <ComponentGrid components={filteredComponents} onDragStart={handleDragStart} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ComponentGrid({
  components,
  onDragStart,
}: {
  components: ComponentDefinition[];
  onDragStart: (e: React.DragEvent, component: ComponentDefinition) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {components.map((component) => (
        <Card
          key={component.type}
          draggable
          onDragStart={(e) => onDragStart(e, component)}
          className="p-4 cursor-move hover:border-foreground transition-colors flex flex-col items-center justify-center gap-2 text-center"
        >
          <div className="text-muted-foreground">{component.icon}</div>
          <span className="text-xs font-medium">{component.label}</span>
        </Card>
      ))}
    </div>
  );
}

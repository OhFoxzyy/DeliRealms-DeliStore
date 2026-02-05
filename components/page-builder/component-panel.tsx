"use client";

import { useMemo, useState } from 'react';
import { componentLibrary, type ComponentDefinition } from './component-library';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { usePageBuilder } from './page-builder-context';

type CategoryFilter = 'all' | 'layout' | 'elements' | 'ecommerce';

export function ComponentPanel() {
  usePageBuilder();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState('');

  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredComponents = useMemo(() => {
    let result = componentLibrary;

    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter((c) =>
        c.label.toLowerCase().includes(term) ||
        c.type.toLowerCase().includes(term),
      );
    }

    return result;
  }, [selectedCategory, search]);

  return (
<<<<<<< HEAD
    <div className="w-80 border-l bg-background h-full overflow-y-auto scrollbar-none">
      <div className="p-4 border-b space-y-3">
=======
    <div className="w-80 border-l border-border/50 bg-background h-full overflow-y-auto">
      <div className="p-4 border-b border-border/50 space-y-3 bg-card/30">
>>>>>>> c9965df20fa6fc21eb504d0fc60fd71845236cf7
        <div>
          <h2 className="text-lg font-semibold text-foreground">Components</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Drag and drop components onto the canvas
          </p>
        </div>
        <Input
          placeholder="Search components..."
          className="h-8 text-xs bg-input border-border/50 focus:border-primary/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as CategoryFilter)} className="w-full">
        <TabsList className="w-full grid grid-cols-4 px-4">
          <TabsTrigger value="all">
            All
          </TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="elements">Elements</TabsTrigger>
          <TabsTrigger value="ecommerce">Shop</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="p-4 space-y-2">
          <ComponentGrid
            components={filteredComponents}
            onDragStart={handleDragStart}
          />
        </TabsContent>
        <TabsContent value="layout" className="p-4 space-y-2">
          <ComponentGrid
            components={filteredComponents}
            onDragStart={handleDragStart}
          />
        </TabsContent>
        <TabsContent value="elements" className="p-4 space-y-2">
          <ComponentGrid
            components={filteredComponents}
            onDragStart={handleDragStart}
          />
        </TabsContent>
        <TabsContent value="ecommerce" className="p-4 space-y-2">
          <ComponentGrid
            components={filteredComponents}
            onDragStart={handleDragStart}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ComponentPreview({ component }: { component: ComponentDefinition }) {
  const content = component.defaultContent || {};
  const style = component.defaultStyle || {};
  return (
    <div className="w-32 p-2 bg-card/80 rounded border border-border/50 space-y-1 backdrop-blur-sm">
      {component.type === 'heading' && <div style={{ ...style, fontSize: '10px', margin: 0 }}>{content.text || 'Heading'}</div>}
      {component.type === 'text' && <div style={{ ...style, fontSize: '8px', margin: 0 }}>{(content.text || 'Text').slice(0, 25)}...</div>}
      {component.type === 'button' && <div style={{ ...style, padding: '2px 6px', fontSize: '8px' }}>{content.text || 'Button'}</div>}
      {component.type === 'container' && <div style={{ ...style, padding: '6px', minHeight: 24 }} className="border border-dashed border-border/50 rounded text-[8px]">Container</div>}
      {component.type === 'image' && <div style={{ ...style, width: 48, height: 32 }} className="bg-muted/50 rounded flex items-center justify-center text-[8px]">Img</div>}
      {component.type === 'hero' && <div style={{ ...style, padding: '6px' }} className="rounded"><span className="text-[8px] font-bold">{content.heading || 'Hero'}</span></div>}
      {component.type === 'divider' && <hr style={style} className="my-1" />}
      {!['heading', 'text', 'button', 'container', 'image', 'hero', 'divider'].includes(component.type) && (
        <div className="text-[8px] text-muted-foreground">{component.label}</div>
      )}
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
        <HoverCard key={component.type} openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Card
              draggable
              onDragStart={(e) => onDragStart(e, component)}
              className="p-4 cursor-move hover:border-primary/50 hover:bg-accent/10 transition-all flex flex-col items-center justify-center gap-2 text-center border-border/50 bg-card/50"
            >
              <div className="text-primary">{component.icon}</div>
              <span className="text-xs font-medium text-foreground">{component.label}</span>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent side="left" className="w-auto p-0">
            <div className="p-1">
              <p className="text-xs text-muted-foreground mb-1">Preview</p>
              <ComponentPreview component={component} />
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
}



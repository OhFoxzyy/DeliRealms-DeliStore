"use client";

import { useEffect, useMemo, useState } from 'react';
import { componentLibrary, type ComponentDefinition } from './component-library';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { usePageBuilder } from './page-builder-context';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type CategoryFilter = 'all' | 'layout' | 'elements' | 'ecommerce';

export function ComponentPanel() {
  usePageBuilder();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [components, setComponents] = useState<ComponentDefinition[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadComponents = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/components');
        if (!res.ok) {
          throw new Error('Failed to load components');
        }
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          // Map API components into the local definition shape.
          const apiComponents: ComponentDefinition[] = data.map((c: any) => {
            const base =
              componentLibrary.find((b) => b.type === c.type) ?? null;

            return {
              type: c.type,
              label: c.name ?? base?.label ?? c.type,
              icon: base?.icon ?? base?.icon ?? null,
              category: (c.category as CategoryFilter) ?? base?.category ?? 'elements',
              defaultContent: c.defaultContent ?? base?.defaultContent ?? {},
              defaultStyle: c.defaultStyle ?? base?.defaultStyle ?? {},
            };
          });

          setComponents(apiComponents);
        } else {
          // Fallback to local library if API returns nothing.
          setComponents(componentLibrary);
        }
      } catch (error) {
        console.error(error);
        toast({
          title: 'Unable to load components',
          description: 'Using the default component set for now.',
          variant: 'destructive',
        });
        setComponents(componentLibrary);
      } finally {
        setIsLoading(false);
      }
    };

    void loadComponents();
  }, [toast]);

  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredComponents = useMemo(() => {
    const source = components ?? componentLibrary;

    let result = source;
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
  }, [components, selectedCategory, search]);

  return (
    <div className="w-80 border-l bg-background h-full overflow-y-auto scrollbar-none">
      <div className="p-4 border-b space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Components</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Drag and drop components onto the canvas
          </p>
        </div>
        <Input
          placeholder="Search components..."
          className="h-8 text-xs"
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
          {isLoading && <ComponentGridSkeleton />}
          {!isLoading && (
            <ComponentGrid
              components={filteredComponents}
              onDragStart={handleDragStart}
            />
          )}
        </TabsContent>
        <TabsContent value="layout" className="p-4 space-y-2">
          {isLoading && <ComponentGridSkeleton />}
          {!isLoading && (
            <ComponentGrid
              components={filteredComponents}
              onDragStart={handleDragStart}
            />
          )}
        </TabsContent>
        <TabsContent value="elements" className="p-4 space-y-2">
          {isLoading && <ComponentGridSkeleton />}
          {!isLoading && (
            <ComponentGrid
              components={filteredComponents}
              onDragStart={handleDragStart}
            />
          )}
        </TabsContent>
        <TabsContent value="ecommerce" className="p-4 space-y-2">
          {isLoading && <ComponentGridSkeleton />}
          {!isLoading && (
            <ComponentGrid
              components={filteredComponents}
              onDragStart={handleDragStart}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ComponentPreview({ component }: { component: ComponentDefinition }) {
  const content = component.defaultContent || {};
  const style = component.defaultStyle || {};
  return (
    <div className="w-32 p-2 bg-muted/50 rounded border border-border space-y-1">
      {component.type === 'heading' && <div style={{ ...style, fontSize: '10px', margin: 0 }}>{content.text || 'Heading'}</div>}
      {component.type === 'text' && <div style={{ ...style, fontSize: '8px', margin: 0 }}>{(content.text || 'Text').slice(0, 25)}...</div>}
      {component.type === 'button' && <div style={{ ...style, padding: '2px 6px', fontSize: '8px' }}>{content.text || 'Button'}</div>}
      {component.type === 'container' && <div style={{ ...style, padding: '6px', minHeight: 24 }} className="border border-dashed border-border rounded text-[8px]">Container</div>}
      {component.type === 'image' && <div style={{ ...style, width: 48, height: 32 }} className="bg-muted rounded flex items-center justify-center text-[8px]">Img</div>}
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
              className="p-4 cursor-move hover:border-foreground transition-colors flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="text-muted-foreground">{component.icon}</div>
              <span className="text-xs font-medium">{component.label}</span>
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

function ComponentGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card
          key={index}
          className="p-4 flex flex-col items-center justify-center gap-2"
        >
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </Card>
      ))}
    </div>
  );
}


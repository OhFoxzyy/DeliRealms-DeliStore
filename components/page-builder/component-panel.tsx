"use client";

import { useMemo, useState } from 'react';
import { componentLibrary, type ComponentDefinition } from './component-library';
import { Input } from '../ui/input';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { usePageBuilder } from './page-builder-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDown, ChevronRight, LayoutGrid, Type, ShoppingBag, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ComponentImport } from './component-import';
import { usePageBuilder } from './page-builder-context';

const categoryMeta: Record<string, { label: string; icon: React.ReactNode; groups?: Record<string, string[]> }> = {
  layout: {
    label: 'Layout',
    icon: <LayoutGrid className="h-4 w-4" />,
    groups: {
      'Containers': ['container', 'container-narrow', 'box', 'center', 'overlay'],
      'Flex & Grid': ['stack', 'flex', 'grid', 'masonry', 'split-screen'],
      'Structure': ['section', 'section-fullbleed', 'section-contained', 'sidebar', 'sticky-header'],
      'Spacing': ['spacer', 'divider'],
    },
  },
  elements: {
    label: 'Elements',
    icon: <Type className="h-4 w-4" />,
    groups: {
      'Typography': ['heading', 'text', 'rich-text', 'blockquote', 'code-block'],
      'Lists & Tables': ['list', 'table', 'timeline', 'breadcrumbs', 'pagination'],
      'Interactive': ['button', 'link', 'accordion', 'tabs', 'dropdown', 'tooltip', 'popover'],
      'Media': ['image', 'video', 'video-player', 'audio-player', 'image-gallery', 'carousel', 'media-grid'],
      'Feedback': ['alert', 'badge', 'progress-bar', 'skeleton'],
    },
  },
  ecommerce: {
    label: 'Shop',
    icon: <ShoppingBag className="h-4 w-4" />,
    groups: {
      'Products': ['product-card', 'pricing-card', 'smart-pricing-table'],
      'Checkout': ['checkout', 'form', 'smart-form'],
      'Marketing': ['hero', 'feature-grid', 'testimonial', 'testimonial-carousel', 'stats', 'animated-stats', 'cta-banner', 'sticky-cta', 'newsletter', 'logo-cloud', 'faq'],
    },
  },
};

export function ComponentPanel() {
  usePageBuilder();
  const [search, setSearch] = useState('');
  const [openLayout, setOpenLayout] = useState(true);
  const [openElements, setOpenElements] = useState(true);
  const [openShop, setOpenShop] = useState(true);

  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const byCategory = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filter = (c: ComponentDefinition) =>
      !term ||
      c.label.toLowerCase().includes(term) ||
      c.type.toLowerCase().includes(term);
    
    const categorize = (category: string) => {
      const all = componentLibrary.filter((c) => c.category === category && filter(c));
      const groups = categoryMeta[category]?.groups || {};
      const grouped: Record<string, ComponentDefinition[]> = {};
      const ungrouped: ComponentDefinition[] = [];
      
      Object.entries(groups).forEach(([groupName, types]) => {
        grouped[groupName] = all.filter(c => types.includes(c.type));
      });
      
      all.forEach(c => {
        const inGroup = Object.values(groups).some(types => types.includes(c.type));
        if (!inGroup) ungrouped.push(c);
      });
      
      return { grouped, ungrouped };
    };
    
    return {
      layout: categorize('layout'),
      elements: categorize('elements'),
      ecommerce: categorize('ecommerce'),
    };
  }, [search]);

  const handleImport = (component: any) => {
    const newElement = {
      id: `${component.type}-${Date.now()}`,
      type: component.type,
      content: component.content || {},
      style: component.style || {},
      children: component.children?.map((child: any) => ({
        id: `${child.type}-${Date.now()}-${Math.random()}`,
        ...child,
      })),
    };
    addElement(newElement);
  };

  return (
    <div className="w-80 h-full flex flex-col bg-[#0a0a0a] border-[#262626] overflow-hidden">
      <Tabs defaultValue="library" className="w-full h-full flex flex-col">
        <div className="p-4 border-b border-[#262626] space-y-3 bg-[#0f0f0f] shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-[#fafafa]">Components</h2>
            <p className="text-xs text-[#737373] mt-1">
              Drag and drop onto the canvas
            </p>
          </div>
          <Input
            placeholder="Search components..."
            className="h-8 text-xs bg-[#171717] border-[#262626] text-[#e5e5e5] placeholder:text-[#525252] focus-visible:ring-[#262626]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <TabsList className="w-full grid grid-cols-2 px-4 bg-[#0f0f0f] border-b border-[#262626] shrink-0">
          <TabsTrigger value="library" className="data-[state=active]:bg-[#171717] data-[state=active]:text-[#fafafa] text-[#737373] text-xs">
            Library
          </TabsTrigger>
          <TabsTrigger value="import" className="data-[state=active]:bg-[#171717] data-[state=active]:text-[#fafafa] text-[#737373] text-xs">
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="flex-1 overflow-y-auto min-h-0">
          {(['layout', 'elements', 'ecommerce'] as const).map((cat) => {
            const categoryData = byCategory[cat];
            const open = cat === 'layout' ? openLayout : cat === 'elements' ? openElements : openShop;
            const setOpen = cat === 'layout' ? setOpenLayout : cat === 'elements' ? setOpenElements : setOpenShop;
            const meta = categoryMeta[cat];
            const totalCount = Object.values(categoryData.grouped).flat().length + categoryData.ungrouped.length;
            
            return (
              <Collapsible key={cat} open={open} onOpenChange={setOpen} className="border-b border-[#262626]">
                <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm font-medium text-[#fafafa] hover:bg-[#171717] transition-colors">
                  {open ? <ChevronDown className="h-4 w-4 text-[#737373]" /> : <ChevronRight className="h-4 w-4 text-[#737373]" />}
                  <span className="text-[#a3a3a3]">{meta.icon}</span>
                  {meta.label}
                  <span className="ml-auto text-xs text-[#525252]">{totalCount}</span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-2 pb-3 pt-1 space-y-3">
                    {Object.entries(categoryData.grouped).map(([groupName, components]) => {
                      if (components.length === 0) return null;
                      const groupKey = `${cat}-${groupName}`;
                      const isGroupOpen = openGroups[groupKey] !== false;
                      
                      return (
                        <Collapsible
                          key={groupName}
                          open={isGroupOpen}
                          onOpenChange={(open) => setOpenGroups({ ...openGroups, [groupKey]: open })}
                        >
                          <CollapsibleTrigger className="flex items-center gap-1.5 w-full px-2 py-1.5 text-left text-xs font-medium text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#171717] rounded transition-colors">
                            {isGroupOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            {groupName}
                            <span className="ml-auto text-xs text-[#525252]">{components.length}</span>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="grid grid-cols-2 gap-2 pl-4 pt-1">
                              {components.map((component) => (
                                <ComponentCard key={component.type} component={component} onDragStart={handleDragStart} />
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                    {categoryData.ungrouped.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {categoryData.ungrouped.map((component) => (
                          <ComponentCard key={component.type} component={component} onDragStart={handleDragStart} />
                        ))}
                      </div>
                    )}
                    {totalCount === 0 && (
                      <p className="text-xs text-[#525252] py-2 px-2">No components match</p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </TabsContent>

        <TabsContent value="import" className="flex-1 min-h-0 overflow-hidden">
          <ComponentImport onImport={handleImport} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ComponentCard({
  component,
  onDragStart,
}: {
  component: ComponentDefinition;
  onDragStart: (e: React.DragEvent, component: ComponentDefinition) => void;
}) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          draggable
          onDragStart={(e) => onDragStart(e, component)}
          className={cn(
            "p-3 rounded-lg border border-[#262626] bg-[#171717] cursor-move",
            "flex flex-col items-center justify-center gap-1.5 text-center",
            "hover:border-[#404040] hover:bg-[#1f1f1f] transition-all"
          )}
        >
          <div className="text-[#6366f1]">{component.icon}</div>
          <span className="text-xs font-medium text-[#e5e5e5] leading-tight">{component.label}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="left" className="w-auto p-0 bg-[#171717] border-[#262626]">
        <div className="p-2">
          <p className="text-xs text-[#737373] mb-1">Preview</p>
          <ComponentPreview component={component} />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function ComponentPreview({ component }: { component: ComponentDefinition }) {
  const content = component.defaultContent || {};
  const style = component.defaultStyle || {};
  return (
    <div className="w-32 p-2 bg-[#0f0f0f] rounded border border-[#262626] space-y-1">
      {component.type === 'heading' && <div style={{ ...style, fontSize: '10px', margin: 0, color: '#e5e5e5' }}>{content.text || 'Heading'}</div>}
      {component.type === 'text' && <div style={{ ...style, fontSize: '8px', margin: 0, color: '#a3a3a3' }}>{(content.text || 'Text').slice(0, 25)}...</div>}
      {component.type === 'button' && <div style={{ ...style, padding: '2px 6px', fontSize: '8px' }}>{content.text || 'Button'}</div>}
      {component.type === 'container' && <div style={{ ...style, padding: '6px', minHeight: 24 }} className="border border-dashed border-[#404040] rounded text-[8px] text-[#737373]">Container</div>}
      {component.type === 'image' && <div style={{ ...style, width: 48, height: 32 }} className="bg-[#262626] rounded flex items-center justify-center text-[8px] text-[#525252]">Img</div>}
      {component.type === 'hero' && <div style={{ ...style, padding: '6px' }} className="rounded"><span className="text-[8px] font-bold text-[#e5e5e5]">{content.heading || 'Hero'}</span></div>}
      {component.type === 'divider' && <hr style={style} className="my-1 border-[#404040]" />}
      {!['heading', 'text', 'button', 'container', 'image', 'hero', 'divider'].includes(component.type) && (
        <div className="text-[8px] text-[#737373]">{component.label}</div>
      )}
    </div>
  );
}

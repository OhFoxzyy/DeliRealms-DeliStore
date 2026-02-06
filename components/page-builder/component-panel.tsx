"use client";

import { useMemo, useState } from 'react';
import { componentLibrary, type ComponentDefinition } from './component-library';
import { Input } from '../ui/input';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { usePageBuilder } from './page-builder-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDown, ChevronRight, LayoutGrid, Type, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  layout: { label: 'Layout', icon: <LayoutGrid className="h-4 w-4" /> },
  elements: { label: 'Elements', icon: <Type className="h-4 w-4" /> },
  ecommerce: { label: 'Shop', icon: <ShoppingBag className="h-4 w-4" /> },
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
    return {
      layout: componentLibrary.filter((c) => c.category === 'layout' && filter(c)),
      elements: componentLibrary.filter((c) => c.category === 'elements' && filter(c)),
      ecommerce: componentLibrary.filter((c) => c.category === 'ecommerce' && filter(c)),
    };
  }, [search]);

  return (
    <div className="w-80 h-full flex flex-col bg-[#0a0a0a] border-[#262626] overflow-hidden">
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

      <div className="flex-1 overflow-y-auto">
        {(['layout', 'elements', 'ecommerce'] as const).map((cat) => {
          const items = byCategory[cat];
          const open = cat === 'layout' ? openLayout : cat === 'elements' ? openElements : openShop;
          const setOpen = cat === 'layout' ? setOpenLayout : cat === 'elements' ? setOpenElements : setOpenShop;
          const meta = categoryMeta[cat];
          return (
            <Collapsible key={cat} open={open} onOpenChange={setOpen} className="border-b border-[#262626]">
              <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm font-medium text-[#fafafa] hover:bg-[#171717] transition-colors">
                {open ? <ChevronDown className="h-4 w-4 text-[#737373]" /> : <ChevronRight className="h-4 w-4 text-[#737373]" />}
                <span className="text-[#a3a3a3]">{meta.icon}</span>
                {meta.label}
                <span className="ml-auto text-xs text-[#525252]">{items.length}</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-2 pb-3 pt-1">
                  {items.length === 0 ? (
                    <p className="text-xs text-[#525252] py-2 px-2">No components match</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((component) => (
                        <ComponentCard key={component.type} component={component} onDragStart={handleDragStart} />
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
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

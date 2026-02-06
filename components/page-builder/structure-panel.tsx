"use client";

import { listPagePacks, clonePackElements } from '@/lib/page-packs';
import { usePageBuilder } from './page-builder-context';
import { LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StructurePanel() {
  const { setElements, elements, addElement } = usePageBuilder();
  const packs = listPagePacks();

  const handleInsert = (replace: boolean) => (packId: string) => {
    const pack = packs.find((p) => p.id === packId);
    if (!pack) return;
    const cloned = clonePackElements(pack.elements);
    if (replace) {
      setElements(cloned);
    } else {
      cloned.forEach((el) => addElement(el));
    }
  };

  return (
    <div className="w-80 h-full flex flex-col bg-[#0a0a0a] border-[#262626] overflow-hidden">
      <div className="p-4 border-b border-[#262626] bg-[#0f0f0f] shrink-0">
        <h2 className="text-lg font-semibold text-[#fafafa]">Structure</h2>
        <p className="text-xs text-[#737373] mt-1">
          Insert full page layouts
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className={cn(
              "rounded-lg border border-[#262626] bg-[#171717] p-4",
              "hover:border-[#404040] transition-colors"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-[#262626] text-[#6366f1]">
                <LayoutTemplate className="h-4 w-4" />
              </div>
              <h3 className="font-medium text-[#fafafa]">{pack.name}</h3>
            </div>
            <p className="text-xs text-[#737373] mb-3">{pack.description}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleInsert(true)(pack.id)}
                className="flex-1 py-1.5 px-2 text-xs font-medium rounded bg-[#262626] text-[#fafafa] hover:bg-[#404040]"
              >
                Replace page
              </button>
              <button
                type="button"
                onClick={() => handleInsert(false)(pack.id)}
                className="flex-1 py-1.5 px-2 text-xs font-medium rounded border border-[#262626] text-[#e5e5e5] hover:bg-[#262626]"
              >
                Append
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePageBuilder } from './page-builder-context';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export function AlignmentGuides() {
  const { elements, selectedElement } = usePageBuilder();
  const [enabled, setEnabled] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(8);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const guides: Array<{ x?: number; y?: number; type: 'vertical' | 'horizontal' }> = [];

    // Calculate alignment guides based on element positions
    const calculateGuides = () => {
      guides.length = 0;
      const positions: { x: Set<number>; y: Set<number> } = { x: new Set(), y: new Set() };

      const extractPositions = (els: any[]) => {
        els.forEach((el) => {
          if (el.style) {
            const rect = document.querySelector(`[data-element-id="${el.id}"]`)?.getBoundingClientRect();
            if (rect) {
              positions.x.add(rect.left);
              positions.x.add(rect.right);
              positions.y.add(rect.top);
              positions.y.add(rect.bottom);
            }
          }
          if (el.children) {
            extractPositions(el.children);
          }
        });
      };

      extractPositions(elements);

      positions.x.forEach((x) => {
        guides.push({ x, type: 'vertical' });
      });
      positions.y.forEach((y) => {
        guides.push({ y, type: 'horizontal' });
      });
    };

    calculateGuides();

    // Render guides
    const renderGuides = () => {
      const existingGuides = canvas.querySelectorAll('.alignment-guide');
      existingGuides.forEach((g) => g.remove());

      guides.forEach((guide) => {
        const guideEl = document.createElement('div');
        guideEl.className = 'alignment-guide';
        guideEl.style.cssText = `
          position: absolute;
          ${guide.type === 'vertical' ? `left: ${guide.x}px; width: 1px; height: 100%;` : `top: ${guide.y}px; height: 1px; width: 100%;`}
          background: var(--page-primary, #6366f1);
          opacity: 0.5;
          pointer-events: none;
          z-index: 9999;
        `;
        canvas.appendChild(guideEl);
      });
    };

    renderGuides();

    const interval = setInterval(() => {
      calculateGuides();
      renderGuides();
    }, 100);

    return () => {
      clearInterval(interval);
      const existingGuides = canvas.querySelectorAll('.alignment-guide');
      existingGuides.forEach((g) => g.remove());
    };
  }, [enabled, elements, canvasRef]);

  const snapValue = (value: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  return (
    <div className="p-4 border-b border-[#262626] space-y-3 bg-[#0f0f0f]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#fafafa]">Alignment Guides</h3>
          <p className="text-xs text-[#737373] mt-1">
            Visual guides for element alignment
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="guides-enabled" className="text-sm text-[#e5e5e5]">
            Show Guides
          </Label>
          <Switch
            id="guides-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="snap-grid" className="text-sm text-[#e5e5e5]">
            Snap to Grid
          </Label>
          <Switch
            id="snap-grid"
            checked={snapToGrid}
            onCheckedChange={setSnapToGrid}
          />
        </div>
        {snapToGrid && (
          <div className="space-y-1">
            <Label className="text-xs text-[#a3a3a3]">Grid Size (px)</Label>
            <input
              type="range"
              min="4"
              max="32"
              step="4"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-[#737373] text-center">{gridSize}px</div>
          </div>
        )}
      </div>
      <div ref={canvasRef} className="hidden" />
    </div>
  );
}

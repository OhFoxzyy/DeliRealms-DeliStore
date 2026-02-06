"use client";

import React, { useMemo } from 'react';
import { usePageBuilder } from './page-builder-context';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PerformancePanel() {
  const { elements } = usePageBuilder();

  const metrics = useMemo(() => {
    const totalElements = elements.length;
    const totalNested = (els: any[]): number => {
      return els.reduce((acc, el) => {
        return acc + 1 + (el.children ? totalNested(el.children) : 0);
      }, 0);
    };
    const nestedCount = totalNested(elements);
    
    // Estimate bundle size (rough calculation)
    const componentTypes = new Set(elements.map(el => el.type));
    const estimatedBundleSize = componentTypes.size * 5; // ~5KB per component type
    
    // Count images
    const imageCount = (els: any[]): number => {
      return els.reduce((acc, el) => {
        const isImage = el.type === 'image' || el.content?.imageSrc || el.content?.src;
        return acc + (isImage ? 1 : 0) + (el.children ? imageCount(el.children) : 0);
      }, 0);
    };
    const images = imageCount(elements);
    
    // Performance score (0-100)
    let score = 100;
    if (nestedCount > 50) score -= 10;
    if (images > 10) score -= 10;
    if (componentTypes.size > 30) score -= 5;
    
    return {
      totalElements,
      nestedCount,
      componentTypes: componentTypes.size,
      estimatedBundleSize: `${estimatedBundleSize}KB`,
      images,
      score: Math.max(0, score),
    };
  }, [elements]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const suggestions = useMemo(() => {
    const suggs: string[] = [];
    
    if (metrics.nestedCount > 50) {
      suggs.push('Consider flattening deeply nested components for better performance');
    }
    if (metrics.images > 10) {
      suggs.push('Optimize images: use WebP format and lazy loading');
    }
    if (metrics.componentTypes > 30) {
      suggs.push('Reduce component variety to improve bundle size');
    }
    if (metrics.nestedCount < 5) {
      suggs.push('Page structure looks good!');
    }
    
    return suggs;
  }, [metrics]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <h2 className="text-lg font-semibold text-[#fafafa]">Performance</h2>
        <p className="text-xs text-[#737373] mt-1">
          Page performance metrics and suggestions
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          <div className="p-4 rounded-lg border border-[#262626] bg-[#171717]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#6366f1]" />
                <span className="text-sm font-medium text-[#fafafa]">Performance Score</span>
              </div>
              <div className={cn("text-2xl font-bold", getScoreColor(metrics.score))}>
                {metrics.score}/100
              </div>
            </div>
            <div className="w-full bg-[#0f0f0f] rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  metrics.score >= 80 ? "bg-green-400" : metrics.score >= 60 ? "bg-yellow-400" : "bg-red-400"
                )}
                style={{ width: `${metrics.score}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-[#262626] bg-[#171717]">
              <div className="text-xs text-[#737373] mb-1">Total Elements</div>
              <div className="text-lg font-semibold text-[#fafafa]">{metrics.totalElements}</div>
            </div>
            <div className="p-3 rounded-lg border border-[#262626] bg-[#171717]">
              <div className="text-xs text-[#737373] mb-1">Nested Elements</div>
              <div className="text-lg font-semibold text-[#fafafa]">{metrics.nestedCount}</div>
            </div>
            <div className="p-3 rounded-lg border border-[#262626] bg-[#171717]">
              <div className="text-xs text-[#737373] mb-1">Component Types</div>
              <div className="text-lg font-semibold text-[#fafafa]">{metrics.componentTypes}</div>
            </div>
            <div className="p-3 rounded-lg border border-[#262626] bg-[#171717]">
              <div className="text-xs text-[#737373] mb-1">Images</div>
              <div className="text-lg font-semibold text-[#fafafa]">{metrics.images}</div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-[#262626] bg-[#171717]">
            <div className="text-xs text-[#737373] mb-2">Estimated Bundle Size</div>
            <div className="text-lg font-semibold text-[#fafafa]">{metrics.estimatedBundleSize}</div>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-[#fafafa] mb-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-[#262626] bg-[#0f0f0f] flex items-start gap-2"
                >
                  {suggestion.includes('good') ? (
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                  )}
                  <p className="text-sm text-[#a3a3a3] flex-1">{suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

interface FullScreenCanvasProps {
  viewport: ViewportSize;
  children: React.ReactNode;
  className?: string;
}

const viewportSizes = {
  desktop: { width: '100%', icon: Monitor },
  tablet: { width: '768px', icon: Tablet },
  mobile: { width: '375px', icon: Smartphone },
};

export function FullScreenCanvas({ viewport, children, className }: FullScreenCanvasProps) {
  const viewportConfig = viewportSizes[viewport];
  const isConstrained = viewport !== 'desktop';

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Viewport indicator - only shown for non-desktop */}
      {isConstrained && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 backdrop-blur-sm">
          <viewportConfig.icon className="h-3 w-3 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-300">
            {viewport.charAt(0).toUpperCase() + viewport.slice(1)} - {viewportConfig.width}
          </span>
        </div>
      )}

      {/* Canvas container */}
      <div className="w-full h-full overflow-auto flex items-start justify-center">
        {isConstrained ? (
          <div className="relative h-full flex items-start justify-center py-16">
            {/* Left indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-neutral-700">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="2" y="2" width="20" height="20" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" />
                  <line x1="12" y1="2" x2="12" y2="22" strokeWidth="2" />
                </svg>
                <span className="text-xs font-mono">[X]</span>
              </div>
            </div>

            {/* Content area */}
            <div 
              style={{ width: viewportConfig.width }}
              className={cn(
                "h-full bg-white shadow-2xl shadow-black/50",
                className
              )}
            >
              {children}
            </div>

            {/* Right indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-neutral-700">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="2" y="2" width="20" height="20" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" />
                  <line x1="12" y1="2" x2="12" y2="22" strokeWidth="2" />
                </svg>
                <span className="text-xs font-mono">[X]</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={cn("w-full h-full bg-white", className)}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

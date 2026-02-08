"use client";

import { useState } from 'react';
import { PageBuilderProvider } from './page-builder-context';
import { EnhancedAIPanel } from './enhanced-ai-panel';
import { ArrowLeft, Monitor, Tablet, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import type { PageData, PageTheme } from '@/lib/page-builder/types';
import { BuilderCanvas } from './builder-canvas';

interface AIEditorPageProps {
  projectId: string;
  pageId: string;
  initialElements: PageData['elements'];
  initialTheme: PageTheme | null;
  pageName: string;
  pageSlug: string;
  pages: { id: string; name: string; slug: string }[];
  projectUrl: string;
}

export function AIEditorPage({
  projectId,
  pageId,
  initialElements,
  initialTheme,
  pageName,
}: AIEditorPageProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <PageBuilderProvider initialElements={initialElements} initialTheme={initialTheme}>
      <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-black border-b border-neutral-800 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/projects/${projectId}/pages/${pageId}/edit`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="h-4 w-px bg-neutral-800" />
            <h1 className="text-sm font-medium text-white">{pageName} - AI Editor</h1>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-neutral-900 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'desktop'
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'tablet'
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'mobile'
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* AI Chat Panel */}
          <div className="w-96 bg-black border-r border-neutral-800 flex flex-col">
            <EnhancedAIPanel projectId={projectId} pageId={pageId} />
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-neutral-950 flex items-center justify-center overflow-auto">
            {viewMode === 'desktop' ? (
              <div className="w-full h-full">
                <BuilderCanvas viewMode={viewMode} />
              </div>
            ) : (
              <div className="relative">
                {/* Viewport Indicator Lines */}
                <div className="absolute -left-8 top-0 bottom-0 w-6 flex flex-col justify-between items-center py-4">
                  <div className="text-[10px] font-mono text-neutral-600">[</div>
                  <div className="text-[10px] font-mono text-neutral-600">]</div>
                </div>
                <div className="absolute -right-8 top-0 bottom-0 w-6 flex flex-col justify-between items-center py-4">
                  <div className="text-[10px] font-mono text-neutral-600">[</div>
                  <div className="text-[10px] font-mono text-neutral-600">]</div>
                </div>

                {/* Canvas Container */}
                <div
                  className="border border-neutral-800 bg-white"
                  style={{
                    width: viewMode === 'tablet' ? '768px' : '375px',
                    minHeight: '600px',
                  }}
                >
                  <BuilderCanvas viewMode={viewMode} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageBuilderProvider>
  );
}

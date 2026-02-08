"use client";

import React, { useState } from 'react';
import { PageBuilderProvider, usePageBuilder } from './page-builder-context';
import { BuilderCanvas } from './builder-canvas';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Monitor, 
  Tablet, 
  Smartphone,
  Palette,
  AlignLeft,
  Settings,
  Box,
  Layout,
  Sparkles,
  Command,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PageElement, PageTheme, PageData } from '@/lib/page-builder/types';
import { CollaborationProvider } from './collaboration-provider';
import { CommandPalette } from './command-palette';
import { EnhancedAIPanel } from './enhanced-ai-panel';
import { PropertiesPanel } from './properties-panel';
import { ComponentsPanel } from './components-panel-v2';
import { FullScreenCanvas } from './full-screen-canvas';

interface PageInfo {
  id: string;
  name: string;
  slug: string;
  isHome: boolean;
}

interface PageBuilderProps {
  projectId: string;
  pageId: string;
  initialElements: PageElement[];
  initialTheme?: PageTheme | null;
  pageName: string;
  pageSlug: string;
  pages?: PageInfo[];
  projectUrl?: string | null;
}

export function PageBuilderV2({ projectId, pageId, initialElements, initialTheme = null, pageName, pageSlug, pages = [], projectUrl = null }: PageBuilderProps) {
  return (
    <PageBuilderProvider initialElements={initialElements} initialTheme={initialTheme}>
      <PageBuilderInner 
        projectId={projectId} 
        pageId={pageId} 
        pageName={pageName}
        pageSlug={pageSlug}
        pages={pages}
        projectUrl={projectUrl}
      />
    </PageBuilderProvider>
  );
}

function PageBuilderInner({ 
  projectId, 
  pageId, 
  pageName,
  pageSlug,
  pages,
  projectUrl,
}: { 
  projectId: string; 
  pageId: string; 
  pageName: string;
  pageSlug: string;
  pages: PageInfo[];
  projectUrl: string | null;
}) {
  return (
    <CollaborationProvider pageId={pageId}>
      <PageBuilderInnerContent
        projectId={projectId}
        pageId={pageId}
        pageName={pageName}
        pageSlug={pageSlug}
        pages={pages}
        projectUrl={projectUrl}
      />
    </CollaborationProvider>
  );
}

function PageBuilderInnerContent({ 
  projectId, 
  pageId, 
  pageName,
  pageSlug,
  pages,
  projectUrl,
}: { 
  projectId: string; 
  pageId: string; 
  pageName: string;
  pageSlug: string;
  pages: PageInfo[];
  projectUrl: string | null;
}) {
  const { elements, selectedElement, theme, undo, redo, canUndo, canRedo, setElements } = usePageBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  
  // Panel states
  const [leftPanel, setLeftPanel] = useState<'theme' | 'alignment' | 'properties' | null>('properties');
  const [rightPanel, setRightPanel] = useState<'components' | 'structure' | null>('components');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const content: PageData = {
        elements,
        globalStyles: {
          theme: theme || undefined,
        },
      };

      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: JSON.stringify(content),
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success('Page saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (projectUrl) {
      const previewUrl = `${projectUrl}${pageSlug === '/' ? '' : pageSlug}`;
      window.open(previewUrl, '_blank');
    } else {
      toast.error('Project URL not configured');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex flex-col bg-black">
        {/* Top Header */}
        <header className="h-14 border-b border-neutral-800 bg-black px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link 
              href={`/dashboard/projects/${projectId}`}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors rounded-md p-1.5 hover:bg-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Separator orientation="vertical" className="h-6 bg-neutral-800" />
            <div>
              <h1 className="text-sm font-medium text-white">{pageName}</h1>
              <p className="text-xs text-neutral-500">/{pageSlug}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode */}
            <div className="flex items-center gap-1 border border-neutral-800 rounded-md p-1 bg-neutral-950">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('desktop')}
                className={cn(
                  "h-7 px-2",
                  viewMode === 'desktop' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                <Monitor className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('tablet')}
                className={cn(
                  "h-7 px-2",
                  viewMode === 'tablet' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                <Tablet className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('mobile')}
                className={cn(
                  "h-7 px-2",
                  viewMode === 'mobile' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                <Smartphone className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6 bg-neutral-800" />

            {/* Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              className="h-8 px-2 text-neutral-400 hover:text-white disabled:opacity-30"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              className="h-8 px-2 text-neutral-400 hover:text-white disabled:opacity-30"
            >
              <Redo2 className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 bg-neutral-800" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="h-8 px-2 text-neutral-400 hover:text-white"
            >
              <Command className="h-4 w-4 mr-1" />
              <span className="text-xs">⌘K</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreview}
              className="h-8 px-3 text-neutral-400 hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 px-4 bg-white text-black hover:bg-neutral-200"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="w-64 border-r border-neutral-800 bg-black flex flex-col shrink-0">
            {/* Panel Tabs */}
            <div className="flex items-center border-b border-neutral-800 bg-neutral-950">
              <button
                onClick={() => setLeftPanel(aiMode ? null : 'theme')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 h-10 text-xs font-medium transition-colors",
                  leftPanel === 'theme' && !aiMode ? "bg-black text-white border-b-2 border-white" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                )}
                disabled={aiMode}
              >
                <Palette className="h-3.5 w-3.5" />
                Theme
              </button>
              <button
                onClick={() => setLeftPanel(aiMode ? null : 'alignment')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 h-10 text-xs font-medium transition-colors",
                  leftPanel === 'alignment' && !aiMode ? "bg-black text-white border-b-2 border-white" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                )}
                disabled={aiMode}
              >
                <AlignLeft className="h-3.5 w-3.5" />
                Align
              </button>
              <button
                onClick={() => setLeftPanel(aiMode ? null : 'properties')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 h-10 text-xs font-medium transition-colors",
                  leftPanel === 'properties' && !aiMode ? "bg-black text-white border-b-2 border-white" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                )}
                disabled={aiMode}
              >
                <Settings className="h-3.5 w-3.5" />
                Props
              </button>
              <button
                onClick={() => setAiMode(!aiMode)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 h-10 text-xs font-medium transition-colors",
                  aiMode ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {aiMode ? (
                <EnhancedAIPanel projectId={projectId} pageId={pageId} />
              ) : (
                <PropertiesPanel 
                  projectId={projectId} 
                  pageId={pageId} 
                  activeTab={leftPanel}
                />
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-hidden">
            <FullScreenCanvas viewport={viewMode}>
              <BuilderCanvas viewMode={viewMode} />
            </FullScreenCanvas>
          </div>

          {/* Right Panel */}
          {!aiMode && (
            <div className="w-72 border-l border-neutral-800 bg-black flex flex-col shrink-0">
              {/* Panel Tabs */}
              <div className="flex items-center border-b border-neutral-800 bg-neutral-950">
                <button
                  onClick={() => setRightPanel('components')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 h-10 text-xs font-medium transition-colors",
                    rightPanel === 'components' ? "bg-black text-white border-b-2 border-white" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                  )}
                >
                  <Box className="h-3.5 w-3.5" />
                  Components
                </button>
                <button
                  onClick={() => setRightPanel('structure')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 h-10 text-xs font-medium transition-colors",
                    rightPanel === 'structure' ? "bg-black text-white border-b-2 border-white" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                  )}
                >
                  <Layout className="h-3.5 w-3.5" />
                  Structure
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto">
                <ComponentsPanel 
                  activeTab={rightPanel}
                  projectId={projectId}
                  pageId={pageId}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        projectId={projectId}
        pageId={pageId}
      />
    </>
  );
}

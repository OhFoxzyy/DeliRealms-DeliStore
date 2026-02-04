"use client";

import { useState } from 'react';
import { PageBuilderProvider, usePageBuilder } from './page-builder-context';
import { BuilderCanvas } from './builder-canvas';
import { ComponentPanel } from './component-panel';
import { StyleEditor } from './style-editor';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Monitor, 
  Tablet, 
  Smartphone,
  RefreshCw,
  ExternalLink,
  Star,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PageElement } from '@/lib/page-builder/types';
import { componentLibrary } from './component-library';

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
  pageName: string;
  pageSlug: string;
  pages?: PageInfo[];
  projectUrl?: string | null;
}

export function PageBuilder({ projectId, pageId, initialElements, pageName, pageSlug, pages = [], projectUrl = null }: PageBuilderProps) {
  return (
    <PageBuilderProvider initialElements={initialElements}>
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
  const { elements, selectedElement, undo, redo, canUndo, canRedo } = usePageBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: JSON.stringify({ elements }),
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

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/pages/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      const generated = data.elements || [];
      if (generated.length > 0) {
        setElements([...elements, ...generated]);
        toast.success(`Added ${generated.length} component(s) from AI`);
        setAiDialogOpen(false);
        setAiPrompt('');
      } else {
        toast.error('No components were generated');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedElement) {
      toast.error('Select an element to save as a template.');
      return;
    }

    const suggestedName =
      selectedElement.content?.text ||
      selectedElement.type.charAt(0).toUpperCase() +
        selectedElement.type.slice(1);

    const name = window.prompt('Template name', suggestedName);
    if (!name) return;

    setIsSavingTemplate(true);
    try {
      const baseDef = componentLibrary.find(
        (c) => c.type === selectedElement.type,
      );

      const response = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type: selectedElement.type,
          category: baseDef?.category ?? 'elements',
          defaultContent: selectedElement.content,
          defaultStyle: selectedElement.style,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as any).error || 'Failed to save template');
      }

      toast.success('Template saved to your library.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save template');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <header className="h-14 border-b border-border/50 bg-background/95 backdrop-blur px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href={`/dashboard/projects/${projectId}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            {pages.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-8">
                    <span className="font-medium">{pageName}</span>
                    <span className="text-muted-foreground text-sm">/{pageSlug}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {pages.map((p) => (
                    <DropdownMenuItem key={p.id} asChild>
                      <Link href={`/dashboard/projects/${projectId}/pages/${p.id}/edit`}>
                        {p.name} {p.isHome && '(Home)'}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <span className="font-medium">{pageName}</span>
                <span className="text-muted-foreground text-sm">Path: /{pageSlug}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Device Preview */}
          <div className="flex items-center border border-border/50 rounded-lg overflow-hidden mr-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-none",
                viewMode === 'desktop' && "bg-accent"
              )}
              onClick={() => setViewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-none border-x border-border/50",
                viewMode === 'tablet' && "bg-accent"
              )}
              onClick={() => setViewMode('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-none",
                viewMode === 'mobile' && "bg-accent"
              )}
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Preview / View */}
          {projectUrl ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href={projectUrl} target="_blank" rel="noopener noreferrer" title="View page">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled title="Deploy to view page">
              <Eye className="h-4 w-4" />
            </Button>
          )}

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Publish Toggle */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm text-muted-foreground">Draft</span>
            <Switch 
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <span className="text-sm">Publish</span>
          </div>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Generate with AI */}
          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate page with Ollama</DialogTitle>
                <DialogDescription>
                  Describe the page you want. Ollama will generate components and add them to your canvas.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="e.g. A hero section with a headline, subtext and CTA button, followed by a 3-column feature grid"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                className="mt-4"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateWithAI} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Save as Template */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveTemplate}
            disabled={isSavingTemplate || !selectedElement}
          >
            <Star className="mr-2 h-4 w-4" />
            Save as template
          </Button>

          {/* Save Button */}
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Style Editor */}
        <StyleEditor />
        
        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <BuilderCanvas viewMode={viewMode} />
        </div>
        
        {/* Right Panel - Components */}
        <ComponentPanel />
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { PageBuilderProvider, usePageBuilder } from './page-builder-context';
import { BuilderCanvas } from './builder-canvas';
import { ComponentPanel } from './component-panel';
import { StructurePanel } from './structure-panel';
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
  ChevronRight,
  X,
  MessageSquare,
  Users,
  Activity,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
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
import type { PageElement, PageTheme, PageData } from '@/lib/page-builder/types';
import { componentLibrary } from './component-library';
import { CollaborationProvider } from './collaboration-provider';
import { CleanupTool } from './cleanup-tool';
import { SeoAccessibilityPanel } from './seo-accessibility-panel';
import { CommentsPanel } from './comments-panel';
import { CollaboratorsPanel } from './collaborators-panel';
import { ChatPanel } from './chat-panel';
import { PreviewLinksPanel } from './preview-links-panel';
import { PerformancePanel } from './performance-panel';
import { CommandPalette } from './command-palette';

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

export function PageBuilder({ projectId, pageId, initialElements, initialTheme = null, pageName, pageSlug, pages = [], projectUrl = null }: PageBuilderProps) {
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
  const { elements, selectedElement, theme, undo, redo, canUndo, canRedo, setElements, addElement } = usePageBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'components' | 'structure' | 'seo' | 'comments' | 'collaborators' | 'chat' | 'preview' | 'performance'>('components');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const toolbarBtn = "text-[#fafafa] hover:bg-[#262626] hover:text-white disabled:opacity-50 disabled:text-[#525252]";

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenPreview) {
        setIsFullscreenPreview(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreenPreview]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
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
        // Use addElement for each to ensure history tracking
        generated.forEach((element: PageElement) => {
          addElement(element);
        });
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
    <>
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0a0a0a]">
      <header className="h-14 border-b border-[#262626] bg-[#0f0f0f] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href={`/dashboard/projects/${projectId}`}
            className={`flex items-center gap-2 ${toolbarBtn} transition-colors rounded-md p-1`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Separator orientation="vertical" className="h-6 bg-[#262626]" />
          <div className="flex items-center gap-2">
            {pages.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`flex items-center gap-2 h-8 ${toolbarBtn}`}>
                    <span className="font-medium">{pageName}</span>
                    <span className="text-[#737373] text-sm">/{pageSlug}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-[#171717] border-[#262626]">
                  {pages.map((p) => (
                    <DropdownMenuItem key={p.id} asChild>
                      <Link href={`/dashboard/projects/${projectId}/pages/${p.id}/edit`} className="text-[#e5e5e5] focus:bg-[#262626] focus:text-[#fafafa]">
                        {p.name} {p.isHome && '(Home)'}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <span className="font-medium text-[#fafafa]">{pageName}</span>
                <span className="text-[#737373] text-sm">Path: /{pageSlug}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center border border-[#262626] rounded-lg overflow-hidden mr-2 bg-[#171717]">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-none", toolbarBtn, viewMode === 'desktop' && "bg-[#262626] text-[#fafafa]")}
              onClick={() => setViewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-none border-x border-[#262626]", toolbarBtn, viewMode === 'tablet' && "bg-[#262626] text-[#fafafa]")}
              onClick={() => setViewMode('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-none", toolbarBtn, viewMode === 'mobile' && "bg-[#262626] text-[#fafafa]")}
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" className={cn("h-8 w-8", toolbarBtn)} onClick={undo} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", toolbarBtn)} onClick={redo} disabled={!canRedo}>
            <Redo2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-2 bg-[#262626]" />

          {projectUrl ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-8 w-8", toolbarBtn)} title="View page">
                  <Eye className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#171717] border-[#262626]">
                <DropdownMenuItem onClick={() => window.open(projectUrl, '_blank')} className="text-[#e5e5e5] focus:bg-[#262626] focus:text-[#fafafa]">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in new tab
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsFullscreenPreview(true)} className="text-[#e5e5e5] focus:bg-[#262626] focus:text-[#fafafa]">
                  <Eye className="mr-2 h-4 w-4" />
                  Fullscreen preview
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className={cn("h-8 w-8", toolbarBtn)} disabled title="Deploy to view page">
              <Eye className="h-4 w-4" />
            </Button>
          )}

          <Separator orientation="vertical" className="h-6 mx-2 bg-[#262626]" />

          <div className="flex items-center gap-2 px-2">
            <span className="text-sm text-[#737373]">Draft</span>
            <Switch 
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <span className="text-sm text-[#fafafa]">Publish</span>
          </div>

          <Separator orientation="vertical" className="h-6 mx-2 bg-[#262626]" />

          <CleanupTool />

          <Separator orientation="vertical" className="h-6 mx-2 bg-[#262626]" />

          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-[#262626] text-[#fafafa] hover:bg-[#262626]">
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

          <Separator orientation="vertical" className="h-6 mx-2 bg-[#262626]" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveTemplate}
            disabled={isSavingTemplate || !selectedElement}
            className="border-[#262626] text-[#fafafa] hover:bg-[#262626] disabled:opacity-50"
          >
            <Star className="mr-2 h-4 w-4" />
            Save as template
          </Button>
          
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

      <div className="flex-1 flex overflow-hidden">
        <Collapsible open={leftPanelOpen} onOpenChange={setLeftPanelOpen} className={cn("flex shrink-0 h-full", leftPanelOpen ? "w-80" : "w-12")}>
          <div className="h-full flex flex-col border-r border-[#262626] w-full">
            <CollapsibleTrigger asChild>
              <button className={cn(
                "flex items-center border-b border-[#262626] bg-[#0f0f0f] text-[#fafafa] hover:bg-[#171717] text-sm font-medium shrink-0",
                leftPanelOpen ? "gap-2 w-full px-3 py-2" : "w-12 h-12 justify-center"
              )}>
                {leftPanelOpen ? (
                  <> <ChevronDown className="h-4 w-4" /> Theme & Properties </>
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex-1 overflow-hidden data-[state=closed]:hidden min-h-0">
              <StyleEditor projectId={projectId} pageId={pageId} />
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <BuilderCanvas viewMode={viewMode} />
        </div>
        
        <Collapsible open={rightPanelOpen} onOpenChange={setRightPanelOpen} className={cn("flex shrink-0 h-full", rightPanelOpen ? "w-80" : "w-12")}>
          <div className="h-full flex flex-col border-l border-[#262626] w-full">
            <CollapsibleTrigger asChild>
              <button className={cn(
                "flex items-center border-b border-[#262626] bg-[#0f0f0f] text-[#fafafa] hover:bg-[#171717] text-sm font-medium shrink-0",
                rightPanelOpen ? "gap-2 w-full px-3 py-2" : "w-12 h-12 justify-center"
              )}>
                {rightPanelOpen ? (
                  <> <ChevronDown className="h-4 w-4" /> Components </>
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex-1 overflow-hidden data-[state=closed]:hidden min-h-0 flex flex-col">
              <div className="flex border-b border-[#262626] shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setRightPanelTab('components')}
                  className={cn(
                    "flex-1 min-w-[33%] py-2 text-xs font-medium",
                    rightPanelTab === 'components' ? "bg-[#262626] text-[#fafafa]" : "text-[#737373] hover:bg-[#171717] hover:text-[#e5e5e5]"
                  )}
                >
                  Components
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab('structure')}
                  className={cn(
                    "flex-1 min-w-[33%] py-2 text-xs font-medium",
                    rightPanelTab === 'structure' ? "bg-[#262626] text-[#fafafa]" : "text-[#737373] hover:bg-[#171717] hover:text-[#e5e5e5]"
                  )}
                >
                  Structure
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab('seo')}
                  className={cn(
                    "flex-1 min-w-[33%] py-2 text-xs font-medium",
                    rightPanelTab === 'seo' ? "bg-[#262626] text-[#fafafa]" : "text-[#737373] hover:bg-[#171717] hover:text-[#e5e5e5]"
                  )}
                >
                  SEO & A11y
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab('comments')}
                  className={cn(
                    "flex-1 min-w-[33%] py-2 text-xs font-medium",
                    rightPanelTab === 'comments' ? "bg-[#262626] text-[#fafafa]" : "text-[#737373] hover:bg-[#171717] hover:text-[#e5e5e5]"
                  )}
                >
                  Comments
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                {rightPanelTab === 'components' && <ComponentPanel />}
                {rightPanelTab === 'structure' && <StructurePanel />}
                {rightPanelTab === 'seo' && <SeoAccessibilityPanel />}
                {rightPanelTab === 'comments' && <CommentsPanel pageId={pageId} />}
                {rightPanelTab === 'collaborators' && <CollaboratorsPanel pageId={pageId} />}
                {rightPanelTab === 'chat' && <ChatPanel pageId={pageId} />}
                {rightPanelTab === 'preview' && <PreviewLinksPanel pageId={pageId} />}
                {rightPanelTab === 'performance' && <PerformancePanel />}
              </div>
              <div className="border-t border-[#262626] p-2 space-y-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRightPanelTab('collaborators')}
                  className={`w-full justify-start text-xs h-8 ${rightPanelTab === 'collaborators' ? 'bg-[#171717]' : ''}`}
                >
                  <Users className="h-3 w-3 mr-2" />
                  Collaborators
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRightPanelTab('chat')}
                  className={`w-full justify-start text-xs h-8 ${rightPanelTab === 'chat' ? 'bg-[#171717]' : ''}`}
                >
                  <MessageSquare className="h-3 w-3 mr-2" />
                  Chat
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRightPanelTab('preview')}
                  className={`w-full justify-start text-xs h-8 ${rightPanelTab === 'preview' ? 'bg-[#171717]' : ''}`}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Preview Links
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRightPanelTab('performance')}
                  className={`w-full justify-start text-xs h-8 ${rightPanelTab === 'performance' ? 'bg-[#171717]' : ''}`}
                >
                  <Activity className="h-3 w-3 mr-2" />
                  Performance
                </Button>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>

      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="h-14 border-b border-border/50 bg-background/95 backdrop-blur px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{pageName}</span>
              <span className="text-muted-foreground text-sm">/{pageSlug}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreenPreview(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            {projectUrl ? (
              <iframe
                src={projectUrl}
                className="w-full h-full border-0"
                title="Page preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2">Page not yet deployed</p>
                  <p className="text-sm">Deploy your project to see a live preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSave={handleSave}
        onPreview={() => setIsFullscreenPreview(true)}
        onUndo={undo}
        onRedo={redo}
      />
    </div>
    </>
  );
}

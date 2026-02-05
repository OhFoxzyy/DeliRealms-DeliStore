"use client";

import React, { useState } from 'react';
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
  X,
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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PageElement, PageTheme, PageData } from '@/lib/page-builder/types';
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
  const { elements, selectedElement, theme, undo, redo, canUndo, canRedo, setElements, addElement } = usePageBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [designerMode, setDesignerMode] = useState(false);
  const [componentName, setComponentName] = useState('');
  const [componentCategory, setComponentCategory] = useState<'layout' | 'elements' | 'ecommerce'>('elements');
  
  // Handle ESC key to close fullscreen preview
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenPreview) {
        setIsFullscreenPreview(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreenPreview]);

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

  const handleSaveComponent = async () => {
    if (elements.length === 0) {
      toast.error('Add at least one element to save as a component.');
      return;
    }

    if (!componentName.trim()) {
      toast.error('Please enter a component name.');
      return;
    }

    setIsSaving(true);
    try {
      // In designer mode, save the root element(s) as a component
      const rootElement = elements[0];
      const baseDef = componentLibrary.find(
        (c) => c.type === rootElement?.type,
      );

      const response = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: componentName.trim(),
          type: rootElement.type,
          category: componentCategory,
          defaultContent: rootElement.content,
          defaultStyle: rootElement.style,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as any).error || 'Failed to save component');
      }

      toast.success('Component saved to your library.');
      setComponentName('');
      setDesignerMode(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save component');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <header className="h-14 border-b border-border/60 bg-background/95 backdrop-blur-sm px-4 flex items-center justify-between shadow-sm">
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
          <div className="flex items-center border border-border/60 rounded-lg overflow-hidden mr-2 bg-card/30">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-none hover:bg-accent/50",
                viewMode === 'desktop' && "bg-primary/20 text-primary"
              )}
              onClick={() => setViewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-none border-x border-border/60 hover:bg-accent/50",
                viewMode === 'tablet' && "bg-primary/20 text-primary"
              )}
              onClick={() => setViewMode('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-none hover:bg-accent/50",
                viewMode === 'mobile' && "bg-primary/20 text-primary"
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
            className="h-8 w-8 hover:bg-accent/50"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-accent/50"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 px-2 border border-border/50 rounded-lg">
            <Button
              variant={!designerMode ? "default" : "ghost"}
              size="sm"
              className={cn("h-7 text-xs", !designerMode && "bg-accent")}
              onClick={() => setDesignerMode(false)}
            >
              Page
            </Button>
            <Button
              variant={designerMode ? "default" : "ghost"}
              size="sm"
              className={cn("h-7 text-xs", designerMode && "bg-accent")}
              onClick={() => setDesignerMode(true)}
            >
              Component
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Preview / View */}
          {projectUrl ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="View page">
                  <Eye className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(projectUrl, '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in new tab
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsFullscreenPreview(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Fullscreen preview
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          {designerMode ? (
            <Dialog open={componentName !== '' || isSaving} onOpenChange={(open) => !open && !isSaving && setComponentName('')}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  disabled={elements.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Component
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Component</DialogTitle>
                  <DialogDescription>
                    Save this component to your library for use across all projects.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Component Name</Label>
                    <Input
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      placeholder="My Custom Component"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={componentCategory} onValueChange={(v) => setComponentCategory(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="layout">Layout</SelectItem>
                        <SelectItem value="elements">Elements</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setComponentName('')}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveComponent} disabled={isSaving || !componentName.trim()}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
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
          )}
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
      
      {/* Fullscreen Preview Overlay */}
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
    </div>
  );
}

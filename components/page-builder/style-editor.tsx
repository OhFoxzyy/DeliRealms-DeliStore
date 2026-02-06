"use client";

import { useState, useEffect } from 'react';
import { usePageBuilder } from './page-builder-context';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Trash2, Plus, X, RotateCcw } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../ui/dialog';
import { cn } from '@/lib/utils';
import type { PageTheme, PageThemePalette, PageThemeGradient } from '@/lib/page-builder/types';

const themePresets: PageTheme[] = [
  {
    id: 'dark-default',
    name: 'Dark default',
    palette: {
      primary: '#6366f1',
      secondary: '#10b981',
      accent: '#f97316',
      background: '#020617',
      surface: '#111827',
      text: '#e5e7eb',
    },
    gradients: [
      {
        id: 'indigo-pink',
        label: 'Indigo → Pink',
        value: 'linear-gradient(135deg, #6366f1, #ec4899)',
      },
      {
        id: 'emerald-cyan',
        label: 'Emerald → Cyan',
        value: 'linear-gradient(135deg, #10b981, #06b6d4)',
      },
    ],
  },
  {
    id: 'light-default',
    name: 'Light',
    palette: {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
    },
    gradients: [
      {
        id: 'blue-purple',
        label: 'Blue → Purple',
        value: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      },
      {
        id: 'sunset',
        label: 'Sunset',
        value: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      },
    ],
  },
  {
    id: 'emerald',
    name: 'Emerald',
    palette: {
      primary: '#10b981',
      secondary: '#06b6d4',
      accent: '#8b5cf6',
      background: '#0a0f0d',
      surface: '#1a2e24',
      text: '#d1fae5',
    },
    gradients: [
      {
        id: 'emerald-teal',
        label: 'Emerald → Teal',
        value: 'linear-gradient(135deg, #10b981, #06b6d4)',
      },
    ],
  },
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    palette: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#fbbf24',
      background: '#1a0a0a',
      surface: '#2d1a1a',
      text: '#fef3c7',
    },
    gradients: [
      {
        id: 'sunset-full',
        label: 'Sunset',
        value: 'linear-gradient(135deg, #f97316, #ec4899, #fbbf24)',
      },
    ],
  },
];

const defaultPalette: PageThemePalette = {
  primary: '#6366f1',
  secondary: '#10b981',
  accent: '#f97316',
  background: '#0a0a0a',
  surface: '#171717',
  text: '#e5e7eb',
};

export function StyleEditor({ projectId }: { projectId: string }) {
  const { selectedElement, updateElement, deleteElement, theme, setTheme } = usePageBuilder();
  const [customThemes, setCustomThemes] = useState<PageTheme[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPalette, setNewPalette] = useState<PageThemePalette>(defaultPalette);
  const [savingCustom, setSavingCustom] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}/themes`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCustomThemes(Array.isArray(data) ? data : []))
      .catch(() => setCustomThemes([]));
  }, [projectId]);

  const ensureDefaultTheme = () => {
    if (theme) return theme;
    const fallback = themePresets[0];
    setTheme(fallback);
    return fallback;
  };

  const currentTheme = ensureDefaultTheme();
  const allThemes = [...themePresets, ...customThemes];

  const handleThemePresetChange = (themeId: string) => {
    const found = allThemes.find((p) => p.id === themeId);
    if (found) setTheme(found);
  };

  const handleResetTheme = () => {
    setTheme(themePresets[0]);
  };

  const handleCreateCustom = async () => {
    if (!newName.trim() || !projectId) return;
    setSavingCustom(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/themes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), palette: newPalette }),
      });
      if (!res.ok) throw new Error('Failed to create');
      const created = await res.json();
      setCustomThemes((prev) => [...prev, created]);
      setTheme(created);
      setCreateOpen(false);
      setNewName('');
      setNewPalette(defaultPalette);
    } catch {
      setSavingCustom(false);
    } finally {
      setSavingCustom(false);
    }
  };

  const handleDeleteCustom = async (id: string) => {
    if (!projectId || !id.startsWith('custom-')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${projectId}/themes?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setCustomThemes((prev) => prev.filter((t) => t.id !== id));
      if (theme?.id === id) setTheme(themePresets[0]);
    } catch {
      setDeletingId(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleContentChange = (key: string, value: any) => {
    if (!selectedElement) return;
    updateElement(selectedElement.id, {
      content: { ...selectedElement.content, [key]: value },
    });
  };

  const handleStyleChange = (key: string, value: string) => {
    if (!selectedElement) return;
    updateElement(selectedElement.id, {
      style: { ...selectedElement.style, [key]: value },
    });
  };

  const handleDelete = () => {
    if (selectedElement) deleteElement(selectedElement.id);
  };

  return (
    <div className="w-80 border-l border-[#262626] bg-[#0a0a0a] h-full flex flex-col">
      <div className="p-4 border-b border-[#262626] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#fafafa]">Theme</h2>
            <p className="text-[11px] text-[#737373]">
              Quickly change your page colors.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Select
            value={currentTheme.id}
            onValueChange={handleThemePresetChange}
          >
            <SelectTrigger className="h-8 text-xs bg-[#171717] border-[#262626] text-[#e5e5e5]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#171717] border-[#262626]">
              {themePresets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id} className="text-[#e5e5e5] focus:bg-[#262626]">
                  {preset.name}
                </SelectItem>
              ))}
              {customThemes.length > 0 && (
                <>
                  <div className="px-2 py-1 text-[10px] text-[#737373] font-medium">My themes</div>
                  {customThemes.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-[#e5e5e5] focus:bg-[#262626]">
                      {t.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="xs" variant="outline" className="h-7 text-[10px] flex-1 border-[#262626] text-[#e5e5e5] hover:bg-[#262626]">
                  <Plus className="mr-1 h-3 w-3" />
                  Custom theme
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#171717] border-[#262626] text-[#e5e5e5]">
                <DialogHeader>
                  <DialogTitle className="text-[#fafafa]">Create custom theme</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label className="text-xs text-[#a3a3a3]">Name</Label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="My theme" className="mt-1 bg-[#0f0f0f] border-[#262626] text-[#fafafa]" />
                  </div>
                  {(['primary', 'secondary', 'accent', 'background', 'surface', 'text'] as const).map((key) => (
                    <div key={key}>
                      <Label className="text-xs text-[#a3a3a3] capitalize">{key}</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={newPalette[key]}
                          onChange={(e) => setNewPalette((p) => ({ ...p, [key]: e.target.value }))}
                          className="w-10 h-8 p-1 bg-[#0f0f0f] border-[#262626] cursor-pointer"
                        />
                        <Input value={newPalette[key]} onChange={(e) => setNewPalette((p) => ({ ...p, [key]: e.target.value }))} className="flex-1 h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#fafafa]" />
                      </div>
                    </div>
                  ))}
                </div>
                <DialogFooter className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)} className="border-[#262626] text-[#e5e5e5] hover:bg-[#262626]">Cancel</Button>
                  <Button size="sm" onClick={handleCreateCustom} disabled={savingCustom || !newName.trim()} className="bg-[#262626] hover:bg-[#404040] text-[#fafafa]">
                    {savingCustom ? 'Saving...' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {currentTheme.id.startsWith('custom-') && (
              <Button
                size="xs"
                variant="outline"
                className="h-7 text-[10px] border-red-500/50 text-red-400 hover:bg-red-500/10"
                onClick={() => handleDeleteCustom(currentTheme.id)}
                disabled={deletingId === currentTheme.id}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1">
            {Object.values(currentTheme.palette).map((color, idx) => (
              <button
                key={`${color}-${idx}`}
                type="button"
                aria-label={color}
                className="h-5 w-5 rounded-[4px] border border-[#262626] hover:scale-110 transition-transform"
                style={{ background: color }}
                title={color}
              />
            ))}
          </div>
          {currentTheme.gradients && currentTheme.gradients.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {currentTheme.gradients.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="h-5 flex-1 min-w-[40px] rounded-[4px] border border-[#262626] hover:scale-110 transition-transform"
                  style={{ backgroundImage: g.value }}
                  title={g.label}
                />
              ))}
            </div>
          )}
          <div className="flex gap-1 pt-1">
            <Button
              size="xs"
              variant="outline"
              className="h-7 text-[10px] flex-1 border-[#262626] text-[#e5e5e5] hover:bg-[#262626]"
              onClick={handleResetTheme}
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {selectedElement ? (
        <>
          <div className="p-4 border-b border-[#262626] flex items-center justify-between bg-[#0f0f0f]">
            <div>
              <h2 className="text-lg font-semibold text-[#fafafa]">Properties</h2>
              <p className="text-xs text-[#737373]">{selectedElement.type}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 scrollbar-none">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full grid grid-cols-2 px-4 bg-[#0f0f0f] border-b border-[#262626]">
                <TabsTrigger value="content" className="data-[state=active]:bg-[#171717] data-[state=active]:text-[#fafafa] text-[#737373]">Content</TabsTrigger>
                <TabsTrigger value="style" className="data-[state=active]:bg-[#171717] data-[state=active]:text-[#fafafa] text-[#737373]">Style</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="p-4 space-y-4">
                <ContentEditor
                  element={selectedElement}
                  onChange={handleContentChange}
                />
              </TabsContent>

              <TabsContent value="style" className="p-4 space-y-4">
                <StyleProperties
                  style={selectedElement.style}
                  onChange={handleStyleChange}
                />
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </>
      ) : (
        <div className="p-4 flex items-center justify-center flex-1 text-center">
          <p className="text-[#737373] text-sm">
            Select an element to edit its properties
          </p>
        </div>
      )}
    </div>
  );
}

function ContentEditor({ element, onChange }: any) {
  switch (element.type) {
    case 'heading':
    case 'text':
      return (
        <div className="space-y-2">
          <Label>Text</Label>
          <Textarea
            value={element.content.text || ''}
            onChange={(e) => onChange('text', e.target.value)}
            rows={4}
          />
        </div>
      );

    case 'button':
      return (
        <>
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input
              value={element.content.text || ''}
              onChange={(e) => onChange('text', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Link (href)</Label>
            <Input
              value={element.content.href || ''}
              onChange={(e) => onChange('href', e.target.value)}
              placeholder="#"
            />
          </div>
        </>
      );

    case 'image':
      return (
        <>
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              value={element.content.src || ''}
              onChange={(e) => onChange('src', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Alt Text</Label>
            <Input
              value={element.content.alt || ''}
              onChange={(e) => onChange('alt', e.target.value)}
            />
          </div>
        </>
      );

    case 'video':
      return (
        <div className="space-y-2">
          <Label>Video URL</Label>
          <Input
            value={element.content.src || ''}
            onChange={(e) => onChange('src', e.target.value)}
            placeholder="https://..."
          />
        </div>
      );

    case 'link':
      return (
        <>
          <div className="space-y-2">
            <Label>Link Text</Label>
            <Input
              value={element.content.text || ''}
              onChange={(e) => onChange('text', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={element.content.href || ''}
              onChange={(e) => onChange('href', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Target</Label>
            <Select
              value={element.content.target || '_self'}
              onValueChange={(value) => onChange('target', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_self">Same window</SelectItem>
                <SelectItem value="_blank">New window</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );

    case 'checkout':
      return (
        <>
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input
              value={element.content.text || ''}
              onChange={(e) => onChange('text', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select
              value={element.content.provider || 'stripe'}
              onValueChange={(value) => onChange('provider', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );

    case 'hero':
      return (
        <>
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input
              value={element.content.heading || ''}
              onChange={(e) => onChange('heading', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Subheading</Label>
            <Textarea
              value={element.content.subheading || ''}
              onChange={(e) => onChange('subheading', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Button text</Label>
            <Input
              value={element.content.buttonText || ''}
              onChange={(e) => onChange('buttonText', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Button link</Label>
            <Input
              value={element.content.buttonHref || ''}
              onChange={(e) => onChange('buttonHref', e.target.value)}
              placeholder="#"
            />
          </div>
        </>
      );

    case 'pricing-card':
      return (
        <>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={element.content.title || ''}
              onChange={(e) => onChange('title', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                value={element.content.price || ''}
                onChange={(e) => onChange('price', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Input
                value={element.content.period || ''}
                onChange={(e) => onChange('period', e.target.value)}
                placeholder="/month"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Features</Label>
            <FeatureListEditor
              items={element.content.features || []}
              onChange={(items) => onChange('features', items)}
            />
          </div>
          <div className="space-y-2">
            <Label>Button text</Label>
            <Input
              value={element.content.buttonText || ''}
              onChange={(e) => onChange('buttonText', e.target.value)}
            />
          </div>
        </>
      );

    case 'feature-grid':
      return (
        <div className="space-y-2">
          <Label>Features</Label>
          <FeatureGridEditor
            items={element.content.features || []}
            onChange={(items) => onChange('features', items)}
          />
        </div>
      );

    default:
      // Generic key-value editor for unknown types
      const contentKeys = Object.keys(element.content || {});
      if (contentKeys.length === 0) {
        return (
          <p className="text-sm text-muted-foreground">
            No content properties for this element type.
          </p>
        );
      }
      return (
        <div className="space-y-2">
          {contentKeys.map((key) => {
            const value = element.content[key];
            const isString = typeof value === 'string';
            const isNumber = typeof value === 'number';
            const isBoolean = typeof value === 'boolean';
            
            if (isBoolean) {
              return (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-xs capitalize">{key}</Label>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => onChange(key, checked)}
                  />
                </div>
              );
            }
            
            if (isString && value.length > 100) {
              return (
                <div key={key} className="space-y-1">
                  <Label className="text-xs capitalize">{key}</Label>
                  <Textarea
                    value={value}
                    onChange={(e) => onChange(key, e.target.value)}
                    rows={3}
                    className="text-xs"
                  />
                </div>
              );
            }
            
            return (
              <div key={key} className="space-y-1">
                <Label className="text-xs capitalize">{key}</Label>
                <Input
                  type={isNumber ? 'number' : 'text'}
                  value={String(value)}
                  onChange={(e) => {
                    const newValue = isNumber ? Number(e.target.value) : e.target.value;
                    onChange(key, newValue);
                  }}
                  className="h-8 text-xs"
                />
              </div>
            );
          })}
        </div>
      );
  }
}

function FeatureListEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const handleUpdate = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...(items || []), 'New feature']);
  };

  const handleRemove = (index: number) => {
    const next = items.filter((_: string, i: number) => i !== index);
    onChange(next);
  };

  if (!items || items.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          No features yet. Add your first feature.
        </p>
        <Button size="xs" variant="outline" type="button" onClick={handleAdd}>
          <Plus className="mr-1 h-3 w-3" />
          Add feature
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((feature: string, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={feature}
            onChange={(e) => handleUpdate(index, e.target.value)}
            className="h-8 text-xs"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => handleRemove(index)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button size="xs" variant="outline" type="button" onClick={handleAdd}>
        <Plus className="mr-1 h-3 w-3" />
        Add feature
      </Button>
    </div>
  );
}

function FeatureGridEditor({
  items,
  onChange,
}: {
  items: { title: string; description: string }[];
  onChange: (items: { title: string; description: string }[]) => void;
}) {
  const handleUpdate = (
    index: number,
    key: 'title' | 'description',
    value: string,
  ) => {
    const next = [...items];
    const current = next[index] || { title: '', description: '' };
    next[index] = { ...current, [key]: value };
    onChange(next);
  };

  const handleAdd = () => {
    onChange([
      ...(items || []),
      { title: 'New feature', description: 'Describe this feature' },
    ]);
  };

  const handleRemove = (index: number) => {
    const next = items.filter((_: any, i: number) => i !== index);
    onChange(next);
  };

  if (!items || items.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          No features yet. Add feature cards to this grid.
        </p>
        <Button size="xs" variant="outline" type="button" onClick={handleAdd}>
          <Plus className="mr-1 h-3 w-3" />
          Add feature
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-md border border-border/60 p-2 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Feature {index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input
              value={item.title || ''}
              onChange={(e) => handleUpdate(index, 'title', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={item.description || ''}
              onChange={(e) =>
                handleUpdate(index, 'description', e.target.value)
              }
              rows={2}
              className="text-xs"
            />
          </div>
        </div>
      ))}
      <Button size="xs" variant="outline" type="button" onClick={handleAdd}>
        <Plus className="mr-1 h-3 w-3" />
        Add feature
      </Button>
    </div>
  );
}

function StyleProperties({ style, onChange }: any) {
  const { theme } = usePageBuilder();
  const currentTheme = theme || themePresets[0];
  
  return (
    <div className="space-y-4">
      {/* Layout */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground">Layout</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Width</Label>
            <Input
              value={style.width || ''}
              onChange={(e) => onChange('width', e.target.value)}
              placeholder="auto"
              className="h-8 bg-input border-border/50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Height</Label>
            <Input
              value={style.height || ''}
              onChange={(e) => onChange('height', e.target.value)}
              placeholder="auto"
              className="h-8 bg-input border-border/50"
            />
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground">Spacing</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Padding</Label>
            <Input
              value={style.padding || ''}
              onChange={(e) => onChange('padding', e.target.value)}
              placeholder="0px"
              className="h-8 bg-input border-border/50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Margin</Label>
            <Input
              value={style.margin || ''}
              onChange={(e) => onChange('margin', e.target.value)}
              placeholder="0px"
              className="h-8 bg-input border-border/50"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Padding Top</Label>
            <Input
              value={style.paddingTop || ''}
              onChange={(e) => onChange('paddingTop', e.target.value)}
              placeholder="auto"
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Padding Bottom</Label>
            <Input
              value={style.paddingBottom || ''}
              onChange={(e) => onChange('paddingBottom', e.target.value)}
              placeholder="auto"
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Padding Left</Label>
            <Input
              value={style.paddingLeft || ''}
              onChange={(e) => onChange('paddingLeft', e.target.value)}
              placeholder="auto"
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Padding Right</Label>
            <Input
              value={style.paddingRight || ''}
              onChange={(e) => onChange('paddingRight', e.target.value)}
              placeholder="auto"
              className="h-8"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Margin Top</Label>
            <Input
              value={style.marginTop || ''}
              onChange={(e) => onChange('marginTop', e.target.value)}
              placeholder="auto"
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Margin Bottom</Label>
            <Input
              value={style.marginBottom || ''}
              onChange={(e) => onChange('marginBottom', e.target.value)}
              placeholder="auto"
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Margin Left</Label>
            <Input
              value={style.marginLeft || ''}
              onChange={(e) => onChange('marginLeft', e.target.value)}
              placeholder="auto"
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Margin Right</Label>
            <Input
              value={style.marginRight || ''}
              onChange={(e) => onChange('marginRight', e.target.value)}
              placeholder="auto"
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground">Typography</h3>
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Font Size</Label>
            <Input
              value={style.fontSize || ''}
              onChange={(e) => onChange('fontSize', e.target.value)}
              placeholder="16px"
              className="h-8 bg-input border-border/50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Font Weight</Label>
            <Select
              value={style.fontWeight || '400'}
              onValueChange={(value) => onChange('fontWeight', value)}
            >
              <SelectTrigger className="h-8 bg-input border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">Light</SelectItem>
                <SelectItem value="400">Normal</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Semibold</SelectItem>
                <SelectItem value="700">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Text Align</Label>
            <Select
              value={style.textAlign || 'left'}
              onValueChange={(value) => onChange('textAlign', value)}
            >
              <SelectTrigger className="h-8 bg-input border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="justify">Justify</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground">Colors</h3>
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Text Color</Label>
            <Input
              type="color"
              value={style.color || '#e5e5e5'}
              onChange={(e) => onChange('color', e.target.value)}
              className="h-8 bg-input border-border/50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Background</Label>
            <Input
              type="color"
              value={style.backgroundColor || '#1a1a1a'}
              onChange={(e) => onChange('backgroundColor', e.target.value)}
              className="h-8 bg-input border-border/50"
            />
          </div>
          {/* Gradient */}
          {currentTheme.gradients && currentTheme.gradients.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">Gradient</Label>
              <div className="flex flex-wrap gap-1">
                {currentTheme.gradients.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onChange('backgroundGradient', g.value)}
                    className={cn(
                      "h-8 flex-1 min-w-[60px] rounded border transition-all",
                      style.backgroundGradient === g.value
                        ? "border-foreground ring-2 ring-foreground/20"
                        : "border-border/60 hover:border-border"
                    )}
                    style={{ backgroundImage: g.value }}
                    title={g.label}
                  />
                ))}
                {style.backgroundGradient && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onChange('backgroundGradient', '')}
                    title="Clear gradient"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Border */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground">Border</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Border Width</Label>
            <Input
              value={style.borderWidth || ''}
              onChange={(e) => onChange('borderWidth', e.target.value)}
              placeholder="0px"
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Border Radius</Label>
            <Input
              value={style.borderRadius || ''}
              onChange={(e) => onChange('borderRadius', e.target.value)}
              placeholder="0px"
              className="h-8 bg-input border-border/50"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Border Color</Label>
          <Input
            type="color"
            value={style.borderColor || '#404040'}
            onChange={(e) => onChange('borderColor', e.target.value)}
            className="h-8 bg-input border-border/50"
          />
        </div>
      </div>

      {/* Display & Flexbox */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground">Display</h3>
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Display</Label>
            <Select
              value={style.display || 'block'}
              onValueChange={(value) => onChange('display', value)}
            >
              <SelectTrigger className="h-8 bg-input border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="block">Block</SelectItem>
                <SelectItem value="flex">Flex</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="inline-block">Inline Block</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {style.display === 'flex' && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Flex Direction</Label>
                <Select
                  value={style.flexDirection || 'row'}
                  onValueChange={(value) => onChange('flexDirection', value)}
                >
                  <SelectTrigger className="h-8 bg-input border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="row">Row</SelectItem>
                    <SelectItem value="column">Column</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Justify Content</Label>
                <Select
                  value={style.justifyContent || 'flex-start'}
                  onValueChange={(value) => onChange('justifyContent', value)}
                >
                  <SelectTrigger className="h-8 bg-input border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex-start">Start</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="flex-end">End</SelectItem>
                    <SelectItem value="space-between">Space Between</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Align Items</Label>
                <Select
                  value={style.alignItems || 'stretch'}
                  onValueChange={(value) => onChange('alignItems', value)}
                >
                  <SelectTrigger className="h-8 bg-input border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stretch">Stretch</SelectItem>
                    <SelectItem value="flex-start">Start</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="flex-end">End</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Positioning */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Position</h3>
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Position</Label>
            <Select
              value={style.position || 'static'}
              onValueChange={(value) => onChange('position', value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Static</SelectItem>
                <SelectItem value="relative">Relative</SelectItem>
                <SelectItem value="absolute">Absolute</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="sticky">Sticky</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Top</Label>
              <Input
                value={style.top || ''}
                onChange={(e) => onChange('top', e.target.value)}
                placeholder="e.g. 0, 10px"
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bottom</Label>
              <Input
                value={style.bottom || ''}
                onChange={(e) => onChange('bottom', e.target.value)}
                placeholder="e.g. 0, 10px"
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Z-index</Label>
              <Input
                value={style.zIndex || ''}
                onChange={(e) => onChange('zIndex', e.target.value)}
                placeholder="e.g. 10"
                className="h-8"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

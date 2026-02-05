"use client";

import { usePageBuilder } from './page-builder-context';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

export function StyleEditor() {
  const { selectedElement, updateElement, deleteElement } = usePageBuilder();

  if (!selectedElement) {
    return (
      <div className="w-80 border-l bg-background p-4 h-full flex items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  const handleContentChange = (key: string, value: any) => {
    updateElement(selectedElement.id, {
      content: { ...selectedElement.content, [key]: value },
    });
  };

  const handleStyleChange = (key: string, value: string) => {
    updateElement(selectedElement.id, {
      style: { ...selectedElement.style, [key]: value },
    });
  };

  const handleDelete = () => {
    deleteElement(selectedElement.id);
  };

  return (
    <div className="w-80 border-l border-border/50 bg-background h-full flex flex-col">
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/30">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Properties</h2>
          <p className="text-xs text-muted-foreground">{selectedElement.type}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="w-full grid grid-cols-2 px-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
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

    default:
      return (
        <p className="text-sm text-muted-foreground">
          No content properties available for this element
        </p>
      );
  }
}

function StyleProperties({ style, onChange }: any) {
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
    </div>
  );
}

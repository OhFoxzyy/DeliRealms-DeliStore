"use client";

import { Type, Square, Image, Video, Link as LinkIcon, Minus, CreditCard, Sparkles, LayoutGrid, Box } from 'lucide-react';
import type { ElementType } from '@/lib/page-builder/types';
import { builtinComponentPresets } from '@/lib/page-builder/component-presets';

export interface ComponentDefinition {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
  category: 'layout' | 'elements' | 'ecommerce';
  defaultContent: any;
  defaultStyle: any;
}

const iconMap: Record<string, React.ReactNode> = {
  box: <Box className="h-4 w-4" />,
  type: <Type className="h-4 w-4" />,
  square: <Square className="h-4 w-4" />,
  image: <Image className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  link: <LinkIcon className="h-4 w-4" />,
  minus: <Minus className="h-4 w-4" />,
  'credit-card': <CreditCard className="h-4 w-4" />,
  sparkles: <Sparkles className="h-4 w-4" />,
  'layout-grid': <LayoutGrid className="h-4 w-4" />,
};

export const componentLibrary: ComponentDefinition[] = builtinComponentPresets.map(
  (preset) => ({
    type: preset.type as ElementType,
    label: preset.label,
    icon: iconMap[preset.icon || 'square'] ?? <Square className="h-4 w-4" />,
    category: preset.category,
    defaultContent: preset.defaultContent,
    defaultStyle: preset.defaultStyle,
  }),
);

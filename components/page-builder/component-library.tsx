"use client";

import type { ElementType } from '@/lib/page-builder/types';

export interface ComponentDefinition {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
  category: 'layout' | 'elements' | 'ecommerce';
  defaultContent: any;
  defaultStyle: any;
}

// Re-export componentList as componentLibrary for backward compatibility
export { componentList as componentLibrary, type ComponentDefinitionWithComponent } from './components';

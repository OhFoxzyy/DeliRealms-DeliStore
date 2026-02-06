"use client";

import React from 'react';
import { usePageBuilder } from './page-builder-context';
import { Wand2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export function CleanupTool() {
  const { elements, setElements } = usePageBuilder();

  const normalizeSpacing = (elements: any[]): any[] => {
    return elements.map((el) => {
      const normalized = { ...el };
      
      // Normalize padding/margin to use consistent spacing scale
      const spacingScale = [0, 4, 8, 12, 16, 24, 32, 48, 64];
      const normalizeValue = (value: string | undefined) => {
        if (!value) return undefined;
        const num = parseInt(value);
        if (isNaN(num)) return value;
        // Find closest spacing value
        const closest = spacingScale.reduce((prev, curr) =>
          Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
        );
        return `${closest}px`;
      };

      if (normalized.style) {
        normalized.style = {
          ...normalized.style,
          padding: normalizeValue(normalized.style.padding),
          margin: normalizeValue(normalized.style.margin),
          paddingTop: normalizeValue(normalized.style.paddingTop),
          paddingBottom: normalizeValue(normalized.style.paddingBottom),
          paddingLeft: normalizeValue(normalized.style.paddingLeft),
          paddingRight: normalizeValue(normalized.style.paddingRight),
          marginTop: normalizeValue(normalized.style.marginTop),
          marginBottom: normalizeValue(normalized.style.marginBottom),
          marginLeft: normalizeValue(normalized.style.marginLeft),
          marginRight: normalizeValue(normalized.style.marginRight),
        };
      }

      if (normalized.children) {
        normalized.children = normalizeSpacing(normalized.children);
      }

      return normalized;
    });
  };

  const removeUnusedStyles = (elements: any[]): any[] => {
    return elements.map((el) => {
      const cleaned = { ...el };
      
      if (cleaned.style) {
        // Remove empty or default styles
        const cleanedStyle: any = {};
        Object.entries(cleaned.style).forEach(([key, value]) => {
          if (value && value !== '0' && value !== '0px' && value !== 'auto' && value !== 'transparent') {
            cleanedStyle[key] = value;
          }
        });
        cleaned.style = cleanedStyle;
      }

      if (cleaned.children) {
        cleaned.children = removeUnusedStyles(cleaned.children);
      }

      return cleaned;
    });
  };

  const autoAlign = (elements: any[]): any[] => {
    return elements.map((el, index) => {
      const aligned = { ...el };
      
      // Auto-align containers and sections
      if (['container', 'section'].includes(el.type)) {
        if (!aligned.style) aligned.style = {};
        if (!aligned.style.display) {
          aligned.style.display = 'flex';
          aligned.style.flexDirection = 'column';
          aligned.style.alignItems = 'stretch';
        }
      }

      if (aligned.children) {
        aligned.children = autoAlign(aligned.children);
      }

      return aligned;
    });
  };

  const handleCleanup = () => {
    try {
      let cleaned = [...elements];
      
      // Apply all cleanup operations
      cleaned = normalizeSpacing(cleaned);
      cleaned = removeUnusedStyles(cleaned);
      cleaned = autoAlign(cleaned);
      
      setElements(cleaned);
      toast.success('Page cleaned up successfully!');
    } catch (error) {
      toast.error('Failed to clean up page');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCleanup}
      className="border-[#262626] text-[#fafafa] hover:bg-[#262626]"
    >
      <Wand2 className="mr-2 h-4 w-4" />
      Clean Up Page
    </Button>
  );
}

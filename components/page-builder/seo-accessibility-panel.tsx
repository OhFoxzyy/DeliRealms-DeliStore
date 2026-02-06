"use client";

import React, { useMemo } from 'react';
import { usePageBuilder } from './page-builder-context';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface Issue {
  type: 'error' | 'warning' | 'info';
  message: string;
  elementId?: string;
  fix?: () => void;
}

export function SeoAccessibilityPanel() {
  const { elements } = usePageBuilder();

  const issues = useMemo(() => {
    const found: Issue[] = [];
    let hasH1 = false;
    const imagesWithoutAlt: string[] = [];
    const buttonsWithoutContrast: string[] = [];
    const missingAriaLabels: string[] = [];

    const checkContrast = (bgColor: string, textColor: string): boolean => {
      // Simplified contrast check - in production, use a proper library
      // This is a placeholder
      return true; // Assume passing for now
    };

    const traverse = (els: any[]) => {
      els.forEach((el) => {
        // Check for H1
        if (el.type === 'heading' && el.content.level === 1) {
          hasH1 = true;
        }

        // Check images without alt
        if (el.type === 'image' && !el.content.alt) {
          imagesWithoutAlt.push(el.id);
        }

        // Check buttons without proper contrast
        if (el.type === 'button') {
          const bg = el.style.backgroundColor || 'var(--page-primary, #6366f1)';
          const text = el.style.color || '#fff';
          if (!checkContrast(bg, text)) {
            buttonsWithoutContrast.push(el.id);
          }
        }

        // Check for missing ARIA labels on interactive elements
        if (['button', 'link', 'form'].includes(el.type) && !el.content.ariaLabel && !el.content.text) {
          missingAriaLabels.push(el.id);
        }

        if (el.children) {
          traverse(el.children);
        }
      });
    };

    traverse(elements);

    if (!hasH1) {
      found.push({
        type: 'error',
        message: 'Missing H1 heading. Pages should have exactly one H1 for SEO.',
      });
    }

    imagesWithoutAlt.forEach((id) => {
      found.push({
        type: 'error',
        message: 'Image missing alt text. Add alt text for accessibility.',
        elementId: id,
      });
    });

    buttonsWithoutContrast.forEach((id) => {
      found.push({
        type: 'warning',
        message: 'Button contrast may be too low. Ensure WCAG AA compliance.',
        elementId: id,
      });
    });

    missingAriaLabels.forEach((id) => {
      found.push({
        type: 'warning',
        message: 'Interactive element missing ARIA label.',
        elementId: id,
      });
    });

    return found;
  }, [elements]);

  const getIcon = (type: Issue['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'info':
        return <AlertCircle className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <h2 className="text-lg font-semibold text-[#fafafa]">SEO & Accessibility</h2>
        <p className="text-xs text-[#737373] mt-1">
          Real-time validation and suggestions
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-3">
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
              <p className="text-[#fafafa] font-medium">All checks passed!</p>
              <p className="text-sm text-[#737373] mt-2">
                Your page meets SEO and accessibility standards.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="destructive">{issues.filter(i => i.type === 'error').length} Errors</Badge>
                <Badge variant="outline">{issues.filter(i => i.type === 'warning').length} Warnings</Badge>
              </div>
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border",
                    issue.type === 'error' && "bg-red-500/10 border-red-500/50",
                    issue.type === 'warning' && "bg-yellow-500/10 border-yellow-500/50",
                    issue.type === 'info' && "bg-blue-500/10 border-blue-500/50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {getIcon(issue.type)}
                    <div className="flex-1">
                      <p className="text-sm text-[#fafafa]">{issue.message}</p>
                      {issue.elementId && (
                        <p className="text-xs text-[#737373] mt-1">Element ID: {issue.elementId}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

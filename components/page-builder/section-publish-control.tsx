"use client";

import React, { useState, useEffect } from 'react';
import { usePageBuilder } from './page-builder-context';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Eye, EyeOff, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SectionStatus {
  elementId: string;
  published: boolean;
}

export function SectionPublishControl({ pageId }: { pageId: string }) {
  const { selectedElement } = usePageBuilder();
  const [sections, setSections] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pageId) return;
    
    fetch(`/api/pages/${pageId}/sections`)
      .then((res) => res.json())
      .then((data) => {
        const statusMap: Record<string, boolean> = {};
        data.forEach((s: SectionStatus) => {
          statusMap[s.elementId] = s.published;
        });
        setSections(statusMap);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [pageId]);

  const handleToggle = async (elementId: string, published: boolean) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elementId, published }),
      });

      if (!response.ok) throw new Error('Failed to update section');
      
      setSections({ ...sections, [elementId]: published });
      toast.success(published ? 'Section published' : 'Section set to draft');
    } catch (error) {
      toast.error('Failed to update section');
    }
  };

  const handlePublishAll = async () => {
    try {
      // Get all element IDs from the page
      const allElementIds: string[] = [];
      const extractIds = (els: any[]) => {
        els.forEach(el => {
          allElementIds.push(el.id);
          if (el.children) extractIds(el.children);
        });
      };
      extractIds(usePageBuilder().elements);

      // Publish all sections
      await Promise.all(
        allElementIds.map(id =>
          fetch(`/api/pages/${pageId}/sections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elementId: id, published: true }),
          })
        )
      );

      const newSections: Record<string, boolean> = {};
      allElementIds.forEach(id => {
        newSections[id] = true;
      });
      setSections(newSections);
      toast.success('All sections published');
    } catch (error) {
      toast.error('Failed to publish all sections');
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-[#737373]">Loading...</div>;
  }

  const isPublished = selectedElement ? sections[selectedElement.id] || false : false;

  return (
    <div className="p-4 border-b border-[#262626] space-y-3 bg-[#0f0f0f]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#fafafa]">Section Publishing</h3>
          <p className="text-xs text-[#737373] mt-1">
            Control draft vs published status per section
          </p>
        </div>
      </div>
      
      {selectedElement ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#262626] bg-[#171717]">
            <div className="flex items-center gap-2">
              {isPublished ? (
                <Eye className="h-4 w-4 text-green-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-[#737373]" />
              )}
              <div>
                <div className="text-sm font-medium text-[#fafafa]">
                  {selectedElement.type}
                </div>
                <div className="text-xs text-[#737373]">
                  {isPublished ? 'Published' : 'Draft'}
                </div>
              </div>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={(checked) => handleToggle(selectedElement.id, checked)}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-[#737373] text-sm">
          Select an element to control its publish status
        </div>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={handlePublishAll}
        className="w-full border-[#262626] text-[#e5e5e5] hover:bg-[#262626]"
      >
        <Save className="h-4 w-4 mr-2" />
        Publish All Sections
      </Button>
    </div>
  );
}

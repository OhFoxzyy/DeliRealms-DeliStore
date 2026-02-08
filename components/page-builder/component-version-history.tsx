"use client";

import React, { useState, useEffect } from 'react';
import { usePageBuilder } from './page-builder-context';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { History, RotateCcw, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ComponentVersion {
  id: string;
  version: number;
  content: any;
  style: any;
  code: string | null;
  comment: string | null;
  createdAt: Date;
}

export function ComponentVersionHistory({ componentId }: { componentId: string }) {
  const [versions, setVersions] = useState<ComponentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<ComponentVersion | null>(null);

  useEffect(() => {
    if (!componentId) return;
    
    fetch(`/api/components/${componentId}/versions`)
      .then((res) => res.json())
      .then((data) => {
        setVersions(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [componentId]);

  const handleRestore = async (version: ComponentVersion) => {
    try {
      const response = await fetch(`/api/components/${componentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultContent: version.content,
          defaultStyle: version.style,
          componentCode: version.code,
        }),
      });

      if (!response.ok) throw new Error('Failed to restore');
      toast.success(`Restored to version ${version.version}`);
    } catch (error) {
      toast.error('Failed to restore version');
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-[#737373]">Loading versions...</div>;
  }

  if (versions.length === 0) {
    return (
      <div className="p-4 text-center text-[#737373]">
        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No version history available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <h2 className="text-lg font-semibold text-[#fafafa]">Version History</h2>
        <p className="text-xs text-[#737373] mt-1">
          View and restore previous versions
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-colors",
                selectedVersion?.id === version.id
                  ? "border-[#6366f1] bg-[#6366f1]/10"
                  : "border-[#262626] bg-[#171717] hover:border-[#404040]"
              )}
              onClick={() => setSelectedVersion(version)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">v{version.version}</Badge>
                  <span className="text-xs text-[#737373]">
                    {format(new Date(version.createdAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Show diff view
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(version);
                    }}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {version.comment && (
                <p className="text-xs text-[#a3a3a3] mt-1">{version.comment}</p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

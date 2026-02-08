"use client";

import React from 'react';
import { PropertyOnlyEditor } from './property-only-editor';
import { AlignmentEditor } from './alignment-editor';
import { ThemeSelector } from './theme-selector';

interface PropertiesPanelProps {
  projectId: string;
  pageId: string;
  activeTab: 'theme' | 'alignment' | 'properties' | null;
}

export function PropertiesPanel({ projectId, pageId, activeTab }: PropertiesPanelProps) {
  if (!activeTab) return null;

  return (
    <div className="h-full overflow-hidden">
      {activeTab === 'theme' && (
        <ThemeSelector projectId={projectId} pageId={pageId} />
      )}
      {activeTab === 'alignment' && (
        <AlignmentEditor />
      )}
      {activeTab === 'properties' && (
        <PropertyOnlyEditor />
      )}
    </div>
  );
}

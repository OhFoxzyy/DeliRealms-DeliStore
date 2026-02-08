"use client";

import React from 'react';
import { ComponentPanel } from './component-panel';
import { StructurePanel } from './structure-panel';

interface ComponentsPanelProps {
  activeTab: 'components' | 'structure' | null;
  projectId: string;
  pageId: string;
}

export function ComponentsPanel({ activeTab, projectId, pageId }: ComponentsPanelProps) {
  if (!activeTab) return null;

  return (
    <div className="h-full">
      {activeTab === 'components' && <ComponentPanel projectId={projectId} pageId={pageId} />}
      {activeTab === 'structure' && <StructurePanel />}
    </div>
  );
}

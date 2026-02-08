"use client";

import React from 'react';
import { ComponentLibrary } from './component-library';
import { StructurePanel } from './structure-panel';

interface ComponentsPanelProps {
  activeTab: 'components' | 'structure' | null;
}

export function ComponentsPanel({ activeTab }: ComponentsPanelProps) {
  if (!activeTab) return null;

  return (
    <div className="h-full">
      {activeTab === 'components' && <ComponentLibrary />}
      {activeTab === 'structure' && <StructurePanel />}
    </div>
  );
}

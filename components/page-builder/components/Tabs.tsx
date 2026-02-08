'use client';

import React, { useState } from 'react';
import type { PageElement } from '@/lib/page-builder/types';

interface TabsProps {
  element: PageElement;
}

export function Tabs({ element }: TabsProps) {
  const tabs = element.content.tabs || [];
  const [activeTab, setActiveTab] = useState(0);
  
  const baseStyle: React.CSSProperties = {
    width: '100%',
    ...(element.style as React.CSSProperties),
  };

  return (
    <div
      style={baseStyle}
      className="tabs-component"
      role="tablist"
      aria-label={element.content.ariaLabel || 'Tabs'}
    >
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--page-border, #262626)',
          gap: '8px',
        }}
      >
        {tabs.map((tab: any, index: number) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tab-panel-${index}`}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === index
                ? '2px solid var(--page-primary, #6366f1)'
                : '2px solid transparent',
              color: activeTab === index
                ? 'var(--page-primary, #6366f1)'
                : 'var(--page-text, #a3a3a3)',
              cursor: 'pointer',
              fontWeight: activeTab === index ? '600' : '400',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label || `Tab ${index + 1}`}
          </button>
        ))}
      </div>
      {tabs[activeTab] && (
        <div
          id={`tab-panel-${activeTab}`}
          role="tabpanel"
          style={{
            padding: '24px',
            color: 'var(--page-text, #a3a3a3)',
          }}
        >
          {tabs[activeTab].content}
        </div>
      )}
    </div>
  );
}

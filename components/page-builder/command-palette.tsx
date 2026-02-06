"use client";

import React, { useState, useEffect } from 'react';
import { Command } from '../ui/command';
import { usePageBuilder } from './page-builder-context';
import { componentLibrary } from './component-library';
import { 
  Search, 
  Component, 
  Layout, 
  ShoppingBag,
  Save,
  Eye,
  Undo2,
  Redo2,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onAddComponent?: (component: any) => void;
  onSave?: () => void;
  onPreview?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function CommandPalette({
  open,
  onClose,
  onAddComponent,
  onSave,
  onPreview,
  onUndo,
  onRedo,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const { addElement } = usePageBuilder();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle handled by parent
      }
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const components = componentLibrary.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  const actions = [
    { id: 'save', label: 'Save Page', icon: Save, action: onSave },
    { id: 'preview', label: 'Preview Page', icon: Eye, action: onPreview },
    { id: 'undo', label: 'Undo', icon: Undo2, action: onUndo },
    { id: 'redo', label: 'Redo', icon: Redo2, action: onRedo },
  ].filter((a) => a.action);

  const handleSelectComponent = (component: any) => {
    const newElement = {
      id: `${component.type}-${Date.now()}`,
      type: component.type,
      content: { ...component.defaultContent },
      style: { ...component.defaultStyle },
      children: component.type === 'container' ? [] : undefined,
    };
    addElement(newElement);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '20vh',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#171717',
          borderRadius: '12px',
          border: '1px solid #262626',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '12px', borderBottom: '1px solid #262626', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search className="h-4 w-4 text-[#737373]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components, actions..."
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fafafa',
              fontSize: '14px',
            }}
          />
          <kbd style={{ padding: '2px 6px', backgroundColor: '#262626', borderRadius: '4px', fontSize: '12px', color: '#737373' }}>
            ESC
          </kbd>
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {actions.length > 0 && (
            <div style={{ padding: '8px' }}>
              <div style={{ fontSize: '12px', color: '#737373', padding: '8px 12px', fontWeight: '600' }}>Actions</div>
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.action?.();
                    onClose();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#e5e5e5',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderRadius: '6px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#262626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ padding: '8px' }}>
            <div style={{ fontSize: '12px', color: '#737373', padding: '8px 12px', fontWeight: '600' }}>Components</div>
            {components.slice(0, 10).map((component) => (
              <button
                key={component.type}
                onClick={() => handleSelectComponent(component)}
                style={{
                  width: '100%',
                  padding: '12px',
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#e5e5e5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderRadius: '6px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#262626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ color: '#6366f1' }}>{component.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{component.label}</div>
                  <div style={{ fontSize: '12px', color: '#737373' }}>{component.category}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

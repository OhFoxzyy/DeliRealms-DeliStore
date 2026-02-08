"use client";

import React, { useState, useEffect } from 'react';
import { usePageBuilder } from './page-builder-context';
import { Button } from '../ui/button';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PREDEFINED_THEMES = [
  // Dark Themes
  {
    id: 'dark-default',
    name: 'Dark Default',
    category: 'dark',
    palette: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#0a0a0a',
      surface: '#171717',
      text: '#fafafa',
    },
    gradients: [
      { id: 'blue-purple', label: 'Blue Purple', value: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
    ],
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    category: 'dark',
    palette: {
      primary: '#1e40af',
      secondary: '#2563eb',
      accent: '#3b82f6',
      background: '#000000',
      surface: '#0a0f1e',
      text: '#dbeafe',
    },
    gradients: [
      { id: 'midnight', label: 'Midnight', value: 'linear-gradient(135deg, #1e3a8a, #1e40af, #2563eb)' },
    ],
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    category: 'dark',
    palette: {
      primary: '#06b6d4',
      secondary: '#3b82f6',
      accent: '#0ea5e9',
      background: '#000000',
      surface: '#0a1628',
      text: '#dbeafe',
    },
    gradients: [
      { id: 'ocean-wave', label: 'Ocean Wave', value: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
    ],
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    category: 'dark',
    palette: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      background: '#000000',
      surface: '#0a1f0f',
      text: '#d1fae5',
    },
    gradients: [
      { id: 'forest', label: 'Forest', value: 'linear-gradient(135deg, #064e3b, #059669, #10b981)' },
    ],
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    category: 'dark',
    palette: {
      primary: '#8b5cf6',
      secondary: '#a855f7',
      accent: '#c084fc',
      background: '#000000',
      surface: '#1a0a2e',
      text: '#f3e8ff',
    },
    gradients: [
      { id: 'purple-haze', label: 'Purple Haze', value: 'linear-gradient(135deg, #6b21a8, #8b5cf6, #a855f7)' },
    ],
  },
  {
    id: 'crimson-red',
    name: 'Crimson Red',
    category: 'dark',
    palette: {
      primary: '#dc2626',
      secondary: '#ef4444',
      accent: '#f87171',
      background: '#000000',
      surface: '#1a0a0a',
      text: '#fee2e2',
    },
    gradients: [
      { id: 'crimson', label: 'Crimson', value: 'linear-gradient(135deg, #7f1d1d, #dc2626, #ef4444)' },
    ],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    category: 'dark',
    palette: {
      primary: '#ff00ff',
      secondary: '#00ffff',
      accent: '#ffff00',
      background: '#000000',
      surface: '#0a0a0a',
      text: '#ffffff',
    },
    gradients: [
      { id: 'cyber', label: 'Cyber', value: 'linear-gradient(135deg, #ff00ff, #00ffff)' },
    ],
  },
  {
    id: 'slate-monochrome',
    name: 'Slate Mono',
    category: 'dark',
    palette: {
      primary: '#64748b',
      secondary: '#94a3b8',
      accent: '#cbd5e1',
      background: '#000000',
      surface: '#0f172a',
      text: '#f1f5f9',
    },
    gradients: [
      { id: 'slate', label: 'Slate', value: 'linear-gradient(135deg, #334155, #64748b, #94a3b8)' },
    ],
  },
  // Light Themes
  {
    id: 'light-default',
    name: 'Light Default',
    category: 'light',
    palette: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
    },
    gradients: [
      { id: 'blue-purple-light', label: 'Blue Purple', value: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
    ],
  },
  {
    id: 'sky-blue',
    name: 'Sky Blue',
    category: 'light',
    palette: {
      primary: '#0ea5e9',
      secondary: '#3b82f6',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f0f9ff',
      text: '#0c4a6e',
    },
    gradients: [
      { id: 'sky', label: 'Sky', value: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' },
    ],
  },
  {
    id: 'mint-green',
    name: 'Mint Green',
    category: 'light',
    palette: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#ffffff',
      surface: '#f0fdf4',
      text: '#064e3b',
    },
    gradients: [
      { id: 'mint', label: 'Mint', value: 'linear-gradient(135deg, #10b981, #059669)' },
    ],
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    category: 'light',
    palette: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#fdba74',
      background: '#ffffff',
      surface: '#fff7ed',
      text: '#7c2d12',
    },
    gradients: [
      { id: 'sunset-light', label: 'Sunset', value: 'linear-gradient(135deg, #f97316, #fb923c)' },
    ],
  },
];

interface ThemeSelectorProps {
  projectId: string;
  pageId: string;
}

export function ThemeSelector({ projectId, pageId }: ThemeSelectorProps) {
  const { theme, setTheme } = usePageBuilder();
  const [customThemes, setCustomThemes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCustomThemes();
  }, [projectId]);

  const loadCustomThemes = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/themes`);
      if (response.ok) {
        const data = await response.json();
        setCustomThemes(data.themes || []);
      }
    } catch (error) {
      console.error('Failed to load custom themes:', error);
    }
  };

  const handleSelectTheme = (selectedTheme: any) => {
    setTheme(selectedTheme);
    toast.success(`Theme "${selectedTheme.name}" applied`);
  };

  const darkThemes = PREDEFINED_THEMES.filter(t => t.category === 'dark');
  const lightThemes = PREDEFINED_THEMES.filter(t => t.category === 'light');

  return (
    <div className="p-3 space-y-4">
      <div>
        <h3 className="text-xs font-medium text-white mb-2 flex items-center gap-2">
          <Palette className="h-3.5 w-3.5" />
          Dark Themes
        </h3>
        <div className="space-y-2">
          {darkThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTheme(t)}
              className={cn(
                "w-full p-2.5 rounded-lg border transition-all text-left group",
                theme?.id === t.id
                  ? "border-white bg-neutral-900"
                  : "border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">{t.name}</span>
                {theme?.id === t.id && (
                  <Check className="h-3.5 w-3.5 text-white" />
                )}
              </div>
              <div className="flex gap-1.5">
                <div
                  className="w-6 h-6 rounded border border-neutral-700"
                  style={{ backgroundColor: t.palette.primary }}
                />
                <div
                  className="w-6 h-6 rounded border border-neutral-700"
                  style={{ backgroundColor: t.palette.secondary }}
                />
                <div
                  className="w-6 h-6 rounded border border-neutral-700"
                  style={{ backgroundColor: t.palette.accent }}
                />
                <div
                  className="w-6 h-6 rounded border border-neutral-700"
                  style={{ backgroundColor: t.palette.background }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-white mb-2 flex items-center gap-2">
          <Palette className="h-3.5 w-3.5" />
          Light Themes
        </h3>
        <div className="space-y-2">
          {lightThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTheme(t)}
              className={cn(
                "w-full p-2.5 rounded-lg border transition-all text-left group",
                theme?.id === t.id
                  ? "border-white bg-neutral-900"
                  : "border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">{t.name}</span>
                {theme?.id === t.id && (
                  <Check className="h-3.5 w-3.5 text-white" />
                )}
              </div>
              <div className="flex gap-1.5">
                <div
                  className="w-6 h-6 rounded border border-neutral-700"
                  style={{ backgroundColor: t.palette.primary }}
                />
                <div
                  className="w-6 h-6 rounded border border-neutral-700"
                  style={{ backgroundColor: t.palette.secondary }}
                />
                <div
                  className="w-6 h-6 rounded border border-neutral-700"
                  style={{ backgroundColor: t.palette.accent }}
                />
                <div
                  className="w-6 h-6 rounded border border-neutral-700"
                  style={{ backgroundColor: t.palette.background }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {customThemes.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-white mb-2">Custom Themes</h3>
          <div className="space-y-2">
            {customThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t)}
                className={cn(
                  "w-full p-2.5 rounded-lg border transition-all text-left",
                  theme?.id === t.id
                    ? "border-white bg-neutral-900"
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white">{t.name}</span>
                  {theme?.id === t.id && (
                    <Check className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <div className="flex gap-1.5">
                  <div
                    className="w-6 h-6 rounded border border-neutral-700"
                    style={{ backgroundColor: t.palette.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded border border-neutral-700"
                    style={{ backgroundColor: t.palette.secondary }}
                  />
                  <div
                    className="w-6 h-6 rounded border border-neutral-700"
                    style={{ backgroundColor: t.palette.accent }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

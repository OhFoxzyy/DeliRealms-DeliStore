"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SpacingValue {
  name: string;
  value: string;
}

const DEFAULT_SPACING: SpacingValue[] = [
  { name: 'xs', value: '4px' },
  { name: 'sm', value: '8px' },
  { name: 'md', value: '16px' },
  { name: 'lg', value: '24px' },
  { name: 'xl', value: '32px' },
  { name: '2xl', value: '48px' },
  { name: '3xl', value: '64px' },
];

export function SpacingScaleEditor({ projectId }: { projectId: string }) {
  const [spacing, setSpacing] = useState<SpacingValue[]>(DEFAULT_SPACING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/spacing-scale`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSpacing(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [projectId]);

  const handleAdd = () => {
    setSpacing([...spacing, { name: '', value: '' }]);
  };

  const handleUpdate = (index: number, field: keyof SpacingValue, value: string) => {
    const updated = [...spacing];
    updated[index] = { ...updated[index], [field]: value };
    setSpacing(updated);
  };

  const handleDelete = (index: number) => {
    setSpacing(spacing.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/spacing-scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spacing),
      });

      if (!response.ok) throw new Error('Failed to save');
      toast.success('Spacing scale saved');
    } catch (error) {
      toast.error('Failed to save spacing scale');
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-[#737373]">Loading...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-[#fafafa]">Spacing Scale</h2>
            <p className="text-xs text-[#737373] mt-1">
              Define global spacing values for consistent design
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-3">
          {spacing.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-[#262626] bg-[#171717]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-[#a3a3a3]">Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                      placeholder="md"
                      className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[#a3a3a3]">Value</Label>
                    <Input
                      value={item.value}
                      onChange={(e) => handleUpdate(index, 'value', e.target.value)}
                      placeholder="16px"
                      className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                    />
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(index)}
                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div
                style={{
                  height: item.value || '16px',
                  backgroundColor: 'var(--page-primary, #6366f1)',
                  borderRadius: '2px',
                  marginTop: '8px',
                }}
                className="spacing-preview"
              />
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={handleAdd}
            className="w-full border-[#262626] text-[#e5e5e5] hover:bg-[#262626]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Spacing Value
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Spacing Scale
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}

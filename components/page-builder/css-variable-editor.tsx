"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Plus, Trash2, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CSSVariable {
  name: string;
  value: string;
  description?: string;
}

export function CssVariableEditor({ projectId }: { projectId: string }) {
  const [variables, setVariables] = useState<CSSVariable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/css-variables`)
      .then((res) => res.json())
      .then((data) => {
        setVariables(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [projectId]);

  const handleAdd = () => {
    setVariables([...variables, { name: '', value: '' }]);
  };

  const handleUpdate = (index: number, field: keyof CSSVariable, value: string) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: value };
    setVariables(updated);
  };

  const handleDelete = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/css-variables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables),
      });

      if (!response.ok) throw new Error('Failed to save');
      toast.success('CSS variables saved');
    } catch (error) {
      toast.error('Failed to save CSS variables');
    }
  };

  const handleExport = () => {
    const css = variables.map((v) => `  --${v.name}: ${v.value};`).join('\n');
    const blob = new Blob([`:root {\n${css}\n}`], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'variables.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple parser for CSS variables
      const matches = text.matchAll(/--([^:]+):\s*([^;]+);/g);
      const imported: CSSVariable[] = [];
      for (const match of matches) {
        imported.push({ name: match[1].trim(), value: match[2].trim() });
      }
      setVariables([...variables, ...imported]);
      toast.success(`Imported ${imported.length} variables`);
    };
    reader.readAsText(file);
  };

  if (loading) {
    return <div className="p-4 text-center text-[#737373]">Loading...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-[#fafafa]">CSS Variables</h2>
            <p className="text-xs text-[#737373] mt-1">
              Manage global CSS variables for your project
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              className="border-[#262626] text-[#e5e5e5] hover:bg-[#262626]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label>
              <Button
                size="sm"
                variant="outline"
                className="border-[#262626] text-[#e5e5e5] hover:bg-[#262626] cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".css"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-3">
          {variables.length === 0 ? (
            <div className="text-center py-8 text-[#737373]">
              <p>No CSS variables defined</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAdd}
                className="mt-4 border-[#262626] text-[#e5e5e5] hover:bg-[#262626]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
            </div>
          ) : (
            <>
              {variables.map((variable, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-[#262626] bg-[#171717] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-[#737373]">Variable {index + 1}</Label>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(index)}
                      className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-[#a3a3a3]">Name (without --)</Label>
                      <Input
                        value={variable.name}
                        onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                        placeholder="primary-color"
                        className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-[#a3a3a3]">Value</Label>
                      <Input
                        value={variable.value}
                        onChange={(e) => handleUpdate(index, 'value', e.target.value)}
                        placeholder="#6366f1"
                        className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-[#a3a3a3]">Description (optional)</Label>
                      <Input
                        value={variable.description || ''}
                        onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                        placeholder="Primary brand color"
                        className="h-8 text-xs bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={handleAdd}
                className="w-full border-[#262626] text-[#e5e5e5] hover:bg-[#262626]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Save Variables
              </Button>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

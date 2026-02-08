"use client";

import React, { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePageBuilder } from './page-builder-context';

interface ParsedComponent {
  type: string;
  content: any;
  style: any;
  children?: ParsedComponent[];
}

export function ComponentImport({ onImport }: { onImport: (component: ParsedComponent) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedComponent | null>(null);

  const parseJSX = (jsxCode: string): ParsedComponent | null => {
    try {
      // Remove imports and exports
      const cleaned = jsxCode
        .replace(/^import.*$/gm, '')
        .replace(/^export.*$/gm, '')
        .trim();

      // Try to extract component props/attributes
      const propsMatch = cleaned.match(/<(\w+)([^>]*)>/);
      if (!propsMatch) {
        throw new Error('Could not parse component structure');
      }

      const componentName = propsMatch[1];
      const propsString = propsMatch[2];

      // Parse props
      const props: any = {};
      const style: any = {};
      const content: any = {};

      // Extract style prop
      const styleMatch = propsString.match(/style=\{([^}]+)\}/);
      if (styleMatch) {
        try {
          const styleObj = eval(`(${styleMatch[1]})`);
          Object.assign(style, styleObj);
        } catch (e) {
          // Ignore style parsing errors
        }
      }

      // Extract className
      const classNameMatch = propsString.match(/className=["']([^"']+)["']/);
      if (classNameMatch) {
        content.className = classNameMatch[1];
      }

      // Extract text content
      const textMatch = cleaned.match(/>([^<]+)</);
      if (textMatch) {
        content.text = textMatch[1].trim();
      }

      // Extract children components
      const children: ParsedComponent[] = [];
      const childrenRegex = /<(\w+)([^>]*)>([^<]*)<\/\1>/g;
      let childMatch;
      while ((childMatch = childrenRegex.exec(cleaned)) !== null) {
        const childType = childMatch[1];
        const childProps = childMatch[2];
        const childText = childMatch[3].trim();

        const childStyle: any = {};
        const childStyleMatch = childProps.match(/style=\{([^}]+)\}/);
        if (childStyleMatch) {
          try {
            const childStyleObj = eval(`(${childStyleMatch[1]})`);
            Object.assign(childStyle, childStyleObj);
          } catch (e) {
            // Ignore
          }
        }

        children.push({
          type: childType.toLowerCase(),
          content: childText ? { text: childText } : {},
          style: childStyle,
        });
      }

      return {
        type: componentName.toLowerCase(),
        content,
        style,
        children: children.length > 0 ? children : undefined,
      };
    } catch (err: any) {
      throw new Error(`Parse error: ${err.message}`);
    }
  };

  const parseJSON = (jsonCode: string): ParsedComponent | null => {
    try {
      const parsed = JSON.parse(jsonCode);
      if (parsed.type && (parsed.content || parsed.style)) {
        return parsed;
      }
      throw new Error('Invalid component JSON structure');
    } catch (err: any) {
      throw new Error(`JSON parse error: ${err.message}`);
    }
  };

  const handleParse = () => {
    if (!code.trim()) {
      setError('Please enter component code');
      return;
    }

    setError(null);
    setPreview(null);

    try {
      let parsed: ParsedComponent | null = null;

      // Try JSON first
      if (code.trim().startsWith('{')) {
        parsed = parseJSON(code);
      } else {
        // Try JSX
        parsed = parseJSX(code);
      }

      if (parsed) {
        setPreview(parsed);
        toast.success('Component parsed successfully');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to parse component');
    }
  };

  const handleImport = () => {
    if (!preview) return;

    onImport(preview);
    setCode('');
    setPreview(null);
    setError(null);
    toast.success('Component imported');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <h2 className="text-lg font-semibold text-[#fafafa]">Import Component</h2>
        <p className="text-xs text-[#737373] mt-1">
          Import component code (JSX or JSON)
        </p>
      </div>

      <div className="p-4 space-y-4 flex-1 min-h-0 overflow-auto">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Component Code</Label>
            <label className="cursor-pointer">
              <Button
                size="sm"
                variant="outline"
                type="button"
                className="border-[#262626] text-[#e5e5e5] hover:bg-[#262626]"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </span>
              </Button>
              <input
                type="file"
                accept=".jsx,.tsx,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`// JSX Example:\n<Button style={{ padding: '12px' }}>Click me</Button>\n\n// JSON Example:\n{\n  "type": "button",\n  "content": { "text": "Click me" },\n  "style": { "padding": "12px" }\n}`}
            rows={12}
            className="font-mono text-sm bg-[#171717] border-[#262626] text-[#e5e5e5]"
          />
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {preview && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Parsed successfully</span>
            </div>
            <div className="p-3 rounded-lg border border-[#262626] bg-[#171717]">
              <div className="text-xs text-[#737373] mb-2">Preview:</div>
              <div className="text-sm text-[#e5e5e5] font-mono">
                <div>Type: {preview.type}</div>
                {preview.content && Object.keys(preview.content).length > 0 && (
                  <div>Content: {JSON.stringify(preview.content, null, 2)}</div>
                )}
                {preview.style && Object.keys(preview.style).length > 0 && (
                  <div>Style: {JSON.stringify(preview.style, null, 2)}</div>
                )}
                {preview.children && preview.children.length > 0 && (
                  <div>Children: {preview.children.length} component(s)</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleParse}
            disabled={!code.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Parse Code
          </Button>
          <Button
            onClick={handleImport}
            disabled={!preview}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Import Component
          </Button>
        </div>
      </div>
    </div>
  );
}

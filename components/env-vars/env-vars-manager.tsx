"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Plus, Trash2, Eye, EyeOff, Download, Upload, Copy, CheckCircle2, AlertCircle, Folder, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface EnvVar {
  id: string;
  key: string;
  value: string;
  group?: string;
}

interface EnvVarsManagerProps {
  projectId: string;
  initialEnvVars: EnvVar[];
}

const ENV_TEMPLATES = {
  stripe: [
    { key: 'STRIPE_SECRET_KEY', description: 'Stripe secret key for payments' },
    { key: 'STRIPE_PUBLISHABLE_KEY', description: 'Stripe publishable key' },
    { key: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook secret' },
  ],
  paypal: [
    { key: 'PAYPAL_CLIENT_ID', description: 'PayPal client ID' },
    { key: 'PAYPAL_CLIENT_SECRET', description: 'PayPal client secret' },
    { key: 'PAYPAL_MODE', description: 'PayPal mode (sandbox or live)' },
  ],
  database: [
    { key: 'DATABASE_URL', description: 'Database connection string' },
    { key: 'DATABASE_HOST', description: 'Database host' },
    { key: 'DATABASE_PORT', description: 'Database port' },
    { key: 'DATABASE_NAME', description: 'Database name' },
    { key: 'DATABASE_USER', description: 'Database user' },
    { key: 'DATABASE_PASSWORD', description: 'Database password' },
  ],
  email: [
    { key: 'SMTP_HOST', description: 'SMTP server host' },
    { key: 'SMTP_PORT', description: 'SMTP server port' },
    { key: 'SMTP_USER', description: 'SMTP username' },
    { key: 'SMTP_PASSWORD', description: 'SMTP password' },
    { key: 'SMTP_FROM', description: 'From email address' },
  ],
};

export function EnvVarsManager({ projectId, initialEnvVars }: EnvVarsManagerProps) {
  const [envVars, setEnvVars] = useState<EnvVar[]>(initialEnvVars);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const groups = Array.from(new Set(envVars.map(v => v.group).filter(Boolean))) as string[];

  const filteredVars = envVars.filter(v => {
    const matchesGroup = selectedGroup === 'all' || v.group === selectedGroup || (!v.group && selectedGroup === 'ungrouped');
    const matchesSearch = !searchQuery || v.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const validateKey = (key: string): string | null => {
    if (!key) return 'Key is required';
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) return 'Key must be uppercase letters, numbers, and underscores only';
    if (envVars.some(v => v.key === key && v.id !== envVars.find(nv => nv.key === newKey)?.id)) return 'Key already exists';
    return null;
  };

  const handleAdd = async () => {
    const keyError = validateKey(newKey);
    if (keyError) {
      setValidationErrors({ key: keyError });
      toast.error(keyError);
      return;
    }

    if (!newKey || !newValue) {
      toast.error('Both key and value are required');
      return;
    }

    setIsAdding(true);
    setValidationErrors({});
    try {
      const response = await fetch(`/api/projects/${projectId}/env-vars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey, value: newValue, group: newGroup || undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add variable');
      }

      const data = await response.json();
      setEnvVars([...envVars, { ...data.envVar, group: newGroup || undefined }]);
      setNewKey('');
      setNewValue('');
      setNewGroup('');
      toast.success('Environment variable added');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/env-vars/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete variable');

      setEnvVars(envVars.filter(ev => ev.id !== id));
      toast.success('Environment variable deleted');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleVisibility = (id: string) => {
    const newVisible = new Set(visibleIds);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleIds(newVisible);
  };

  const handleExport = () => {
    const exportData = envVars.map(v => ({ key: v.key, value: v.value, group: v.group }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `env-vars-${projectId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Environment variables exported');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        throw new Error('Invalid file format');
      }

      // Validate and add each variable
      for (const item of data) {
        if (!item.key || !item.value) continue;
        const keyError = validateKey(item.key);
        if (keyError) {
          toast.error(`Skipping ${item.key}: ${keyError}`);
          continue;
        }

        try {
          const response = await fetch(`/api/projects/${projectId}/env-vars`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: item.key, value: item.value, group: item.group }),
          });

          if (response.ok) {
            const result = await response.json();
            setEnvVars([...envVars, { ...result.envVar, group: item.group }]);
          }
        } catch (error) {
          console.error(`Failed to import ${item.key}:`, error);
        }
      }

      toast.success(`Imported ${data.length} environment variables`);
    } catch (error) {
      toast.error('Failed to import file');
    }
  };

  const applyTemplate = (template: typeof ENV_TEMPLATES[keyof typeof ENV_TEMPLATES]) => {
    template.forEach(item => {
      if (!envVars.some(v => v.key === item.key)) {
        setNewKey(item.key);
        toast.info(`Template applied: ${item.key}. Enter the value.`);
      }
    });
  };

  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success('Value copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Templates */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>Quickly add common environment variable sets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(ENV_TEMPLATES).map(([name, vars]) => (
              <Button
                key={name}
                variant="outline"
                className="justify-start capitalize"
                onClick={() => applyTemplate(vars)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {name} ({vars.length} vars)
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add New Variable */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Add New Variable</CardTitle>
          <CardDescription>Environment variables are encrypted and securely stored</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                placeholder="STRIPE_SECRET_KEY"
                value={newKey}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
                  setNewKey(val);
                  const error = validateKey(val);
                  setValidationErrors(prev => ({ ...prev, key: error || '' }));
                }}
                className={`bg-input border-border/50 ${validationErrors.key ? 'border-destructive' : ''}`}
              />
              {validationErrors.key && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.key}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="password"
                placeholder="sk_test_..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="bg-input border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group">Group (Optional)</Label>
              <Input
                id="group"
                placeholder="Payment, Database, etc."
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                className="bg-input border-border/50"
              />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={isAdding || !newKey || !newValue || !!validationErrors.key}>
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? 'Adding...' : 'Add Variable'}
          </Button>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Import & Export</CardTitle>
          <CardDescription>Bulk import or export environment variables</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <label>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            <Button variant="outline" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Import JSON
              </span>
            </Button>
          </label>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Environment Variables ({filteredVars.length})</CardTitle>
              <CardDescription>Manage your environment variables</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search variables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-input border-border/50"
              />
              {groups.length > 0 && (
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="w-40 bg-input border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="ungrouped">Ungrouped</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVars.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchQuery || selectedGroup !== 'all' 
                ? 'No variables match your filters' 
                : 'No environment variables yet. Add one above to get started.'}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredVars.map((envVar) => (
                <div
                  key={envVar.id}
                  className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      {envVar.group && (
                        <Badge variant="secondary" className="gap-1">
                          <Folder className="h-3 w-3" />
                          {envVar.group}
                        </Badge>
                      )}
                      <p className="font-mono text-sm font-medium">{envVar.key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-muted-foreground flex-1 truncate">
                        {visibleIds.has(envVar.id)
                          ? envVar.value
                          : '•'.repeat(Math.min(envVar.value.length, 20))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVisibility(envVar.id)}
                        className="h-8 w-8"
                      >
                        {visibleIds.has(envVar.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      {visibleIds.has(envVar.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyValue(envVar.value)}
                          className="h-8 w-8"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(envVar.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

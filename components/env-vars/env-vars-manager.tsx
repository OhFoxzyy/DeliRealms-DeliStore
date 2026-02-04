"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface EnvVar {
  id: string;
  key: string;
  value: string;
}

interface EnvVarsManagerProps {
  projectId: string;
  initialEnvVars: EnvVar[];
}

export function EnvVarsManager({ projectId, initialEnvVars }: EnvVarsManagerProps) {
  const [envVars, setEnvVars] = useState<EnvVar[]>(initialEnvVars);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  const handleAdd = async () => {
    if (!newKey || !newValue) {
      toast.error('Both key and value are required');
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/env-vars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey, value: newValue }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add variable');
      }

      const data = await response.json();
      setEnvVars([...envVars, data.envVar]);
      setNewKey('');
      setNewValue('');
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

  const commonEnvVars = [
    { key: 'STRIPE_SECRET_KEY', description: 'Stripe secret key for payments' },
    { key: 'STRIPE_PUBLISHABLE_KEY', description: 'Stripe publishable key' },
    { key: 'PAYPAL_CLIENT_ID', description: 'PayPal client ID' },
    { key: 'PAYPAL_CLIENT_SECRET', description: 'PayPal client secret' },
    { key: 'PAYPAL_MODE', description: 'PayPal mode (sandbox or live)' },
  ];

  return (
    <div className="space-y-6">
      {/* Common Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Common Variables</CardTitle>
          <CardDescription>
            Quick add commonly used environment variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {commonEnvVars.map((envVar) => (
              <Button
                key={envVar.key}
                variant="outline"
                className="justify-start"
                onClick={() => setNewKey(envVar.key)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {envVar.key}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add New Variable */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Variable</CardTitle>
          <CardDescription>
            Environment variables are encrypted and securely stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                placeholder="STRIPE_SECRET_KEY"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="password"
                placeholder="sk_test_..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={isAdding || !newKey || !newValue}>
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? 'Adding...' : 'Add Variable'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Variables ({envVars.length})</CardTitle>
          <CardDescription>
            Manage your environment variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          {envVars.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No environment variables yet. Add one above to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {envVars.map((envVar) => (
                <div
                  key={envVar.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-mono text-sm font-medium">{envVar.key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-muted-foreground flex-1">
                        {visibleIds.has(envVar.id)
                          ? envVar.value
                          : '•'.repeat(Math.min(envVar.value.length, 20))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVisibility(envVar.id)}
                    >
                      {visibleIds.has(envVar.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(envVar.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

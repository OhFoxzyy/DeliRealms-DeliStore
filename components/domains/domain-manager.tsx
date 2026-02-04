"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Globe, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DomainManagerProps {
  projectId: string;
  subdomain: string | null;
  customDomain: string | null;
}

export function DomainManager({ projectId, subdomain: initialSubdomain, customDomain: initialCustomDomain }: DomainManagerProps) {
  const [subdomain, setSubdomain] = useState(initialSubdomain || '');
  const [customDomain, setCustomDomain] = useState(initialCustomDomain || '');
  const [isUpdatingSubdomain, setIsUpdatingSubdomain] = useState(false);
  const [isAddingCustomDomain, setIsAddingCustomDomain] = useState(false);

  const handleUpdateSubdomain = async () => {
    if (!subdomain) {
      toast.error('Subdomain is required');
      return;
    }

    setIsUpdatingSubdomain(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/domains`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update subdomain');
      }

      toast.success('Subdomain updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdatingSubdomain(false);
    }
  };

  const handleAddCustomDomain = async () => {
    if (!customDomain) {
      toast.error('Custom domain is required');
      return;
    }

    setIsAddingCustomDomain(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/domains`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add custom domain');
      }

      toast.success('Custom domain added successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAddingCustomDomain(false);
    }
  };

  const subdomainUrl = subdomain ? `https://${subdomain}.delistore.app` : null;

  return (
    <div className="space-y-6">
      {/* Subdomain */}
      <Card>
        <CardHeader>
          <CardTitle>DeliStore Subdomain</CardTitle>
          <CardDescription>
            Your project will be accessible at this subdomain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialSubdomain && (
            <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm flex-1">{subdomainUrl}</span>
              <Badge variant="outline" className="gap-1">
                <Check className="h-3 w-3" />
                Active
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <a href={subdomainUrl!} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain"
                placeholder="my-store"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                .delistore.app
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Choose a unique subdomain (lowercase letters, numbers, and hyphens only)
            </p>
          </div>

          <Button
            onClick={handleUpdateSubdomain}
            disabled={isUpdatingSubdomain || !subdomain || subdomain === initialSubdomain}
          >
            {isUpdatingSubdomain ? 'Updating...' : initialSubdomain ? 'Update Subdomain' : 'Set Subdomain'}
          </Button>
        </CardContent>
      </Card>

      {/* Custom Domain */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Domain</CardTitle>
          <CardDescription>
            Use your own domain for this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialCustomDomain && (
            <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm flex-1">{initialCustomDomain}</span>
              <Badge variant="outline" className="gap-1">
                <Check className="h-3 w-3" />
                Active
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <a href={`https://${initialCustomDomain}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="customDomain">Domain Name</Label>
            <Input
              id="customDomain"
              placeholder="store.example.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
            />
            <p className="text-xs text-muted-foreground">
              Enter your custom domain (e.g., store.example.com)
            </p>
          </div>

          {customDomain && !initialCustomDomain && (
            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                <p className="font-medium text-sm">DNS Configuration Required</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Add these DNS records to your domain provider:
              </p>
              <div className="space-y-1 font-mono text-xs bg-background p-2 rounded">
                <p>Type: CNAME</p>
                <p>Name: {customDomain.split('.')[0]}</p>
                <p>Value: proxy.delistore.app</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleAddCustomDomain}
            disabled={isAddingCustomDomain || !customDomain || customDomain === initialCustomDomain}
          >
            {isAddingCustomDomain ? 'Adding...' : initialCustomDomain ? 'Update Domain' : 'Add Custom Domain'}
          </Button>
        </CardContent>
      </Card>

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Help</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Subdomain:</strong> Get started quickly with a free delistore.app subdomain. Perfect for testing and development.
          </p>
          <p>
            <strong>Custom Domain:</strong> Use your own domain to build your brand. You'll need to configure DNS records with your domain provider.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

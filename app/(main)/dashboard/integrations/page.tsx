"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Github, CreditCard, Webhook, CheckCircle2, XCircle, Clock, ExternalLink, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof Github;
  enabled: boolean;
  configured: boolean;
  config?: {
    apiKey?: string;
    webhookUrl?: string;
    repository?: string;
  };
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered?: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { 
      id: 'github', 
      name: 'GitHub', 
      description: 'Import projects from GitHub repositories and sync code', 
      icon: Github, 
      enabled: false,
      configured: false,
    },
    { 
      id: 'stripe', 
      name: 'Stripe', 
      description: 'Accept payments with Stripe checkout integration', 
      icon: CreditCard, 
      enabled: false,
      configured: false,
    },
  ]);

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);

  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [stripeDialogOpen, setStripeDialogOpen] = useState(false);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [stripeKey, setStripeKey] = useState('');
  const [stripeSecret, setStripeSecret] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, enabled: !int.enabled } : int
    ));
    toast.success(`Integration ${integrations.find(i => i.id === id)?.name} ${integrations.find(i => i.id === id)?.enabled ? 'disabled' : 'enabled'}`);
  };

  const handleConfigureGithub = () => {
    if (!githubToken) {
      toast.error('Please enter a GitHub token');
      return;
    }
    setIntegrations(prev => prev.map(int => 
      int.id === 'github' ? { ...int, configured: true, enabled: true, config: { apiKey: githubToken } } : int
    ));
    setGithubDialogOpen(false);
    toast.success('GitHub integration configured');
  };

  const handleConfigureStripe = () => {
    if (!stripeKey || !stripeSecret) {
      toast.error('Please enter both API key and secret');
      return;
    }
    setIntegrations(prev => prev.map(int => 
      int.id === 'stripe' ? { ...int, config: { apiKey: stripeKey, webhookUrl: `https://api.example.com/webhooks/stripe` } } : int
    ));
    setStripeDialogOpen(false);
    toast.success('Stripe integration updated');
  };

  const handleAddWebhook = () => {
    if (!newWebhookUrl) {
      toast.error('Please enter a webhook URL');
      return;
    }
    const webhook: Webhook = {
      id: Date.now().toString(),
      url: newWebhookUrl,
      events: selectedEvents,
      status: 'active',
    };
    setWebhooks(prev => [...prev, webhook]);
    setNewWebhookUrl('');
    setSelectedEvents([]);
    setWebhookDialogOpen(false);
    toast.success('Webhook added');
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
    toast.success('Webhook deleted');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Integrations</h1>
        <p className="text-muted-foreground">
          Connect external services and manage webhooks
        </p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {integrations.map((int) => (
            <Card key={int.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <int.icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{int.name}</CardTitle>
                        {int.configured && (
                          <Badge variant={int.enabled ? 'default' : 'secondary'}>
                            {int.enabled ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{int.description}</CardDescription>
                      {int.config?.apiKey && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          API Key: {int.config.apiKey}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {int.configured && (
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`toggle-${int.id}`} className="text-sm">Enabled</Label>
                        <Switch
                          id={`toggle-${int.id}`}
                          checked={int.enabled}
                          onCheckedChange={() => handleToggleIntegration(int.id)}
                        />
                      </div>
                    )}
                    <Dialog open={int.id === 'github' ? githubDialogOpen : stripeDialogOpen} onOpenChange={int.id === 'github' ? setGithubDialogOpen : setStripeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant={int.configured ? 'outline' : 'default'}>
                          {int.configured ? 'Configure' : 'Setup'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configure {int.name}</DialogTitle>
                          <DialogDescription>
                            {int.id === 'github' 
                              ? 'Enter your GitHub personal access token to enable repository access.'
                              : 'Enter your Stripe API credentials to enable payment processing.'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {int.id === 'github' ? (
                            <>
                              <div>
                                <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                                <Input
                                  id="github-token"
                                  type="password"
                                  placeholder="ghp_xxxxxxxxxxxx"
                                  value={githubToken}
                                  onChange={(e) => setGithubToken(e.target.value)}
                                  className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Create a token with repo permissions at{' '}
                                  <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">
                                    github.com/settings/tokens
                                  </a>
                                </p>
                              </div>
                              <Button onClick={handleConfigureGithub} className="w-full">
                                Connect GitHub
                              </Button>
                            </>
                          ) : (
                            <>
                              <div>
                                <Label htmlFor="stripe-key">Publishable Key</Label>
                                <Input
                                  id="stripe-key"
                                  placeholder="pk_test_..."
                                  value={stripeKey}
                                  onChange={(e) => setStripeKey(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="stripe-secret">Secret Key</Label>
                                <Input
                                  id="stripe-secret"
                                  type="password"
                                  placeholder="sk_test_..."
                                  value={stripeSecret}
                                  onChange={(e) => setStripeSecret(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <Button onClick={handleConfigureStripe} className="w-full">
                                Save Configuration
                              </Button>
                            </>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Webhooks</h2>
              <p className="text-sm text-muted-foreground">Manage webhook endpoints for your integrations</p>
            </div>
            <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Webhook className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Webhook</DialogTitle>
                  <DialogDescription>
                    Configure a new webhook endpoint
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://api.example.com/webhooks"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Events</Label>
                    <div className="mt-2 space-y-2">
                      {['payment.succeeded', 'payment.failed', 'subscription.created', 'subscription.updated'].map(event => (
                        <div key={event} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`event-${event}`}
                            checked={selectedEvents.includes(event)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEvents([...selectedEvents, event]);
                              } else {
                                setSelectedEvents(selectedEvents.filter(e => e !== event));
                              }
                            }}
                          />
                          <Label htmlFor={`event-${event}`} className="text-sm font-normal cursor-pointer">
                            {event}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddWebhook} className="w-full">
                    Add Webhook
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {webhooks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No webhooks configured</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-base">{webhook.url}</CardTitle>
                          <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                            {webhook.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {webhook.events.map(event => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                        {webhook.lastTriggered && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(webhook.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Logs</CardTitle>
              <CardDescription>Recent activity from your integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[].length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No integration logs yet</p>
                  </div>
                ) : (
                  [].map((log: { id: string; type: string; service: string; event: string; status: string; time: string }) => (
                    <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg border border-border">
                    <div className="flex-shrink-0 mt-1">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{log.service}</span>
                        <Badge variant="outline" className="text-xs">{log.type}</Badge>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                          {log.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.event}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

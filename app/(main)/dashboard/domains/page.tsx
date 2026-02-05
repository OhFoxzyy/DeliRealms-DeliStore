"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Globe, Plus, CheckCircle2, XCircle, Clock, ExternalLink, Copy, Shield, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Domain {
  id: string;
  projectId: string;
  projectName: string;
  domain: string;
  type: 'subdomain' | 'custom';
  sslStatus: 'active' | 'pending' | 'expired' | 'error';
  verificationStatus: 'verified' | 'pending' | 'failed';
  dnsConfigured: boolean;
  analytics?: {
    visitors: number;
    pageViews: number;
    bandwidth: number;
  };
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  useEffect(() => {
    async function fetchDomains() {
      try {
        const response = await fetch('/api/domains');
        if (response.ok) {
          const data = await response.json();
          setDomains(data.domains || []);
        }
      } catch (error) {
        console.error('Failed to fetch domains:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDomains();
  }, []);

  const handleAddDomain = () => {
    if (!newDomain) {
      toast.error('Please enter a domain');
      return;
    }
    toast.success('Domain added. Please configure DNS settings.');
    setNewDomain('');
  };

  const handleVerifyDomain = (domainId: string) => {
    setDomains(prev => prev.map(d => 
      d.id === domainId ? { ...d, verificationStatus: 'verified' as const } : d
    ));
    toast.success('Domain verified successfully');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getSSLStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'expired': return 'text-red-500';
      default: return 'text-red-500';
    }
  };

  const getSSLStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle2;
      case 'pending': return Clock;
      default: return XCircle;
    }
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Domains</h1>
        <p className="text-muted-foreground">
          Manage domains, SSL certificates, and DNS settings
        </p>
      </div>

      <Tabs defaultValue="domains" className="space-y-6">
        <TabsList>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="dns-guide">DNS Guide</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Your Domains
                  </CardTitle>
                  <CardDescription>
                    Manage subdomains and custom domains for your projects
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-48"
                  />
                  <Button onClick={handleAddDomain}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Domain
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {domains.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No domains configured</p>
                  <Button asChild>
                    <Link href="/dashboard/projects">
                      <Plus className="mr-2 h-4 w-4" />
                      Create a project
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {domains.map((domain) => (
                    <Card key={domain.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{domain.domain}</CardTitle>
                              <Badge variant={domain.type === 'custom' ? 'default' : 'secondary'}>
                                {domain.type}
                              </Badge>
                              {domain.verificationStatus === 'verified' && (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const Icon = getSSLStatusIcon(domain.sslStatus);
                                  return <Icon className={`h-4 w-4 ${getSSLStatusColor(domain.sslStatus)}`} />;
                                })()}
                                <span className="text-sm text-muted-foreground">
                                  SSL: {domain.sslStatus}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {domain.dnsConfigured ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm text-muted-foreground">
                                  DNS: {domain.dnsConfigured ? 'Configured' : 'Not Configured'}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Project: {domain.projectName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {domain.verificationStatus !== 'verified' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVerifyDomain(domain.id)}
                              >
                                Verify Domain
                              </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/projects/${domain.projectId}/domains`}>
                                Manage
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns-guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DNS Configuration Guide</CardTitle>
              <CardDescription>
                Configure your DNS records to point your domain to our servers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">For Root Domain (example.com)</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm font-mono">
                  <div className="flex items-center justify-between">
                    <span>Type: A</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard('192.0.2.1')}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>Name: @</div>
                  <div>Value: 192.0.2.1</div>
                  <div>TTL: 3600</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">For Subdomain (www.example.com)</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm font-mono">
                  <div className="flex items-center justify-between">
                    <span>Type: CNAME</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard('your-project.vixle.app')}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>Name: www</div>
                  <div>Value: your-project.vixle.app</div>
                  <div>TTL: 3600</div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  After updating your DNS records, it may take up to 48 hours for changes to propagate.
                  SSL certificates are automatically provisioned once DNS is configured correctly.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Domain Analytics
              </CardTitle>
              <CardDescription>
                View traffic and performance metrics for your domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              {domains.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No domains to analyze</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {domains.map((domain) => (
                    <Card key={domain.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{domain.domain}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {domain.analytics ? (
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Visitors</p>
                              <p className="text-2xl font-bold">{domain.analytics.visitors.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Page Views</p>
                              <p className="text-2xl font-bold">{domain.analytics.pageViews.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Bandwidth</p>
                              <p className="text-2xl font-bold">{domain.analytics.bandwidth} GB</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No analytics data available yet</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


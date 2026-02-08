'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Users, Globe } from 'lucide-react';

interface AbusePattern {
  id: string;
  type: string;
  description: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  lastDetected: Date;
}

export function AbuseManagement() {
  const [patterns, setPatterns] = useState<AbusePattern[]>([]);
  const [stats, setStats] = useState({ totalFlags: 0, blockedIps: 0, multiAccounts: 0 });

  useEffect(() => {
    // Fetch abuse patterns
    setPatterns([
      { id: '1', type: 'Multiple Accounts', description: '5 accounts from IP 192.168.1.100', count: 5, severity: 'high', lastDetected: new Date() },
      { id: '2', type: 'Email Alias Abuse', description: 'user+1, user+2 pattern detected', count: 3, severity: 'medium', lastDetected: new Date() },
    ]);
    setStats({ totalFlags: 12, blockedIps: 3, multiAccounts: 8 });
  }, []);

  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{'Abuse Detection'}</h1>
        <p className="mt-1 text-muted-foreground">
          {'Monitor suspicious activities, IP tracking, and abuse patterns'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{stats.totalFlags}</div>
              <div className="text-sm text-muted-foreground">{'Total Flags'}</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <Globe className="h-8 w-8 text-orange-500" />
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{stats.blockedIps}</div>
              <div className="text-sm text-muted-foreground">{'Blocked IPs'}</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <Users className="h-8 w-8 text-yellow-500" />
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{stats.multiAccounts}</div>
              <div className="text-sm text-muted-foreground">{'Multi-Account Patterns'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{'Recent Abuse Patterns'}</h2>
        <div className="space-y-3">
          {patterns.map((pattern) => (
            <div key={pattern.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  pattern.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                  pattern.severity === 'medium' ? 'bg-orange-500/10 text-orange-500' :
                  'bg-yellow-500/10 text-yellow-500'
                }`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{pattern.type}</div>
                  <div className="text-sm text-muted-foreground">{pattern.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  pattern.severity === 'high' ? 'text-destructive' :
                  pattern.severity === 'medium' ? 'text-orange-500' :
                  'text-yellow-500'
                }`}>
                  {pattern.count} instances
                </div>
                <div className="text-xs text-muted-foreground">
                  {pattern.lastDetected.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

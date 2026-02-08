'use client';

import { useState, useEffect } from 'react';
import { Plus, Shield, Users, Lock } from 'lucide-react';
import Link from 'next/link';

const ROLES = [
  { id: 'hobby', name: 'Hobby', description: 'Basic access for personal use', color: 'bg-gray-500/10 text-gray-500' },
  { id: 'pro', name: 'Pro', description: 'Enhanced features for professionals', color: 'bg-blue-500/10 text-blue-500' },
  { id: 'elite', name: 'Elite', description: 'Premium features and priority support', color: 'bg-yellow-500/10 text-yellow-500' },
  { id: 'admin', name: 'Admin', description: 'Full system access and management', color: 'bg-purple-500/10 text-purple-500' },
];

export function RolesManagement() {
  const [roleStats, setRoleStats] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchRoleStats();
  }, []);

  const fetchRoleStats = async () => {
    try {
      const response = await fetch('/api/management/roles');
      if (response.ok) {
        const data = await response.json();
        setRoleStats(data.stats || {});
      }
    } catch (error) {
      console.error('[v0] Error fetching role stats:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{'Role Management'}</h1>
          <p className="mt-1 text-muted-foreground">
            {'Configure roles, permissions, and access controls'}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          {'Create Custom Role'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((role) => (
          <Link
            key={role.id}
            href={`/management/roles/${role.id}/manage`}
            className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${role.color}`}>
                <Shield className="h-6 w-6" />
              </div>
              <div className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${role.color}`}>
                {roleStats[role.id] || 0} users
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                {role.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              {'Configure Permissions →'}
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{'Permission Matrix'}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Permission
                </th>
                {ROLES.map((role) => (
                  <th key={role.id} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 text-sm text-foreground">{'View Content'}</td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-foreground">{'Create Projects'}</td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-foreground">{'Advanced Features'}</td>
                <td className="px-4 py-3 text-center"><span className="text-muted-foreground">✗</span></td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-foreground">{'Priority Support'}</td>
                <td className="px-4 py-3 text-center"><span className="text-muted-foreground">✗</span></td>
                <td className="px-4 py-3 text-center"><span className="text-muted-foreground">✗</span></td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-foreground">{'Admin Access'}</td>
                <td className="px-4 py-3 text-center"><span className="text-muted-foreground">✗</span></td>
                <td className="px-4 py-3 text-center"><span className="text-muted-foreground">✗</span></td>
                <td className="px-4 py-3 text-center"><span className="text-muted-foreground">✗</span></td>
                <td className="px-4 py-3 text-center"><span className="text-green-500">✓</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

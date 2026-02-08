'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Ban, Shield, Mail, Key, Activity } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserDetailManagementProps {
  userId: string;
}

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isBanned: boolean;
  banReason: string | null;
  emailVerified: Date | null;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  createdAt: Date;
}

export function UserDetailManagement({ userId }: UserDetailManagementProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      const response = await fetch(`/api/management/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setSelectedRole(data.role);
      }
    } catch (error) {
      console.error('[v0] Error fetching user detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/management/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (response.ok) {
        fetchUserDetail();
      }
    } catch (error) {
      console.error('[v0] Error updating role:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBanUser = async () => {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/management/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (response.ok) {
        fetchUserDetail();
      }
    } catch (error) {
      console.error('[v0] Error banning user:', error);
    }
  };

  const handleUnbanUser = async () => {
    try {
      const response = await fetch(`/api/management/users/${userId}/unban`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchUserDetail();
      }
    } catch (error) {
      console.error('[v0] Error unbanning user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">{'Loading user details...'}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">{'User not found'}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/management/users"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{'Manage User'}</h1>
          <p className="mt-1 text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Shield className="h-5 w-5" />
              {'User Information'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <div className="mt-1 text-foreground">{user.name || 'Not set'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user.email}</span>
                  {user.emailVerified ? (
                    <span className="text-xs text-green-500">{'Verified'}</span>
                  ) : (
                    <span className="text-xs text-destructive">{'Unverified'}</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <div className="mt-1 flex items-center gap-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="hobby">Hobby</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Elite</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={handleUpdateRole}
                    disabled={saving || selectedRole === user.role}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Update Role'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Activity className="h-5 w-5" />
              {'Recent Activity'}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-sm text-foreground">{'Last Login'}</div>
                <div className="text-sm text-muted-foreground">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-sm text-foreground">{'Last IP Address'}</div>
                <div className="font-mono text-sm text-muted-foreground">{user.lastLoginIp || '-'}</div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                <div className="text-sm text-foreground">{'Account Created'}</div>
                <div className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{'Quick Actions'}</h2>
            <div className="space-y-2">
              {user.isBanned ? (
                <>
                  <button
                    onClick={handleUnbanUser}
                    className="w-full rounded-lg border border-border bg-green-500/10 px-4 py-2 text-sm font-medium text-green-500 transition-colors hover:bg-green-500/20"
                  >
                    {'Unban User'}
                  </button>
                  <div className="rounded-lg bg-destructive/10 p-3">
                    <div className="text-xs font-medium text-destructive">{'Ban Reason:'}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{user.banReason || 'No reason provided'}</div>
                  </div>
                </>
              ) : (
                <button
                  onClick={handleBanUser}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                >
                  <Ban className="h-4 w-4" />
                  {'Ban User'}
                </button>
              )}
              <button className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                {'Send Password Reset'}
              </button>
              <button className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                {'View Login History'}
              </button>
              <Link
                href={`/management/permissions/${user.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Key className="h-4 w-4" />
                {'Manage Permissions'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

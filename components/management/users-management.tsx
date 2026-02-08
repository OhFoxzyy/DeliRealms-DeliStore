'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, MoreVertical, Shield, Ban, Mail } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isBanned: boolean;
  emailVerified: Date | null;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  createdAt: Date;
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/management/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('[v0] Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="mt-1 text-muted-foreground">
            {'Manage users, roles, and permissions across your platform'}
          </p>
        </div>
        <Link
          href="/management/users/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <UserPlus className="h-4 w-4" />
          {'Add User'}
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Roles</option>
            <option value="hobby">Hobby</option>
            <option value="pro">Pro</option>
            <option value="elite">Elite</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  IP Address
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    {'Loading users...'}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    {'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{user.name || 'Unnamed User'}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {user.emailVerified ? (
                              <>
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </>
                            ) : (
                              <span className="text-destructive">{user.email} (unverified)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' :
                        user.role === 'elite' ? 'bg-yellow-500/10 text-yellow-500' :
                        user.role === 'pro' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {user.role === 'admin' && <Shield className="h-3 w-3" />}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                          <Ban className="h-3 w-3" />
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {user.lastLoginIp || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/management/users/${user.id}/manage`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <MoreVertical className="h-3 w-3" />
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold text-foreground">{users.length}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'admin').length}</div>
          <div className="text-sm text-muted-foreground">Admins</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold text-foreground">{users.filter(u => u.isBanned).length}</div>
          <div className="text-sm text-muted-foreground">Banned</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-2xl font-bold text-foreground">{users.filter(u => !u.emailVerified).length}</div>
          <div className="text-sm text-muted-foreground">Unverified</div>
        </div>
      </div>
    </div>
  );
}

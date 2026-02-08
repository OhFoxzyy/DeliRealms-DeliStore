'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import Link from 'next/link';

interface RoleDetailManagementProps {
  roleId: string;
}

const PERMISSIONS = [
  { id: 'view_content', label: 'View Content', category: 'Content' },
  { id: 'create_projects', label: 'Create Projects', category: 'Projects' },
  { id: 'edit_projects', label: 'Edit Projects', category: 'Projects' },
  { id: 'delete_projects', label: 'Delete Projects', category: 'Projects' },
  { id: 'manage_users', label: 'Manage Users', category: 'Administration' },
  { id: 'manage_roles', label: 'Manage Roles', category: 'Administration' },
  { id: 'view_analytics', label: 'View Analytics', category: 'Analytics' },
  { id: 'export_data', label: 'Export Data', category: 'Data' },
];

export function RoleDetailManagement({ roleId }: RoleDetailManagementProps) {
  const [permissions, setPermissions] = useState<Set<string>>(new Set(['view_content', 'create_projects']));
  const [saving, setSaving] = useState(false);

  const togglePermission = (permId: string) => {
    setPermissions(prev => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    // Save permissions logic here
    setTimeout(() => setSaving(false), 1000);
  };

  const roleName = roleId.charAt(0).toUpperCase() + roleId.slice(1);

  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/management/roles"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{roleName} Role</h1>
          <p className="mt-1 text-muted-foreground">{'Configure permissions for this role'}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Shield className="h-5 w-5" />
            {'Permissions'}
          </h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-6">
          {['Content', 'Projects', 'Administration', 'Analytics', 'Data'].map((category) => (
            <div key={category}>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">{category}</h3>
              <div className="space-y-2">
                {PERMISSIONS.filter(p => p.category === category).map((perm) => (
                  <label
                    key={perm.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted"
                  >
                    <span className="text-sm font-medium text-foreground">{perm.label}</span>
                    <input
                      type="checkbox"
                      checked={permissions.has(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

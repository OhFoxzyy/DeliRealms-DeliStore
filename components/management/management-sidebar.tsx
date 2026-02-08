'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Shield,
  AlertTriangle,
  Ticket,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navigationItems = [
  { href: '/management', label: 'Overview', icon: LayoutDashboard },
  { href: '/management/users', label: 'Users', icon: Users },
  { href: '/management/roles', label: 'Roles', icon: Shield },
  { href: '/management/abuse', label: 'Abuse Detection', icon: AlertTriangle },
  { href: '/management/tickets', label: 'Support Tickets', icon: Ticket },
  { href: '/management/settings', label: 'Settings', icon: Settings },
];

export function ManagementSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-card transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-foreground">Management</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        {!isCollapsed ? (
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="text-xs font-medium text-foreground">Admin Panel</div>
            <div className="mt-1 text-xs text-muted-foreground">
              You have full access to all management features
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
    </aside>
  );
}

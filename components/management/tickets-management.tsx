'use client';

import { useState } from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Ticket {
  id: string;
  subject: string;
  userEmail: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export function TicketsManagement() {
  const [tickets] = useState<Ticket[]>([
    { id: '1', subject: 'Cannot access dashboard', userEmail: 'user@example.com', status: 'open', priority: 'high', createdAt: new Date() },
    { id: '2', subject: 'Feature request: Dark mode', userEmail: 'another@example.com', status: 'in_progress', priority: 'medium', createdAt: new Date() },
  ]);

  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{'Support Tickets'}</h1>
        <p className="mt-1 text-muted-foreground">
          {'Manage user support requests and inquiries'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <div className="mt-2 text-2xl font-bold text-foreground">12</div>
          <div className="text-sm text-muted-foreground">{'Open'}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <Clock className="h-8 w-8 text-orange-500" />
          <div className="mt-2 text-2xl font-bold text-foreground">5</div>
          <div className="text-sm text-muted-foreground">{'In Progress'}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <div className="mt-2 text-2xl font-bold text-foreground">34</div>
          <div className="text-sm text-muted-foreground">{'Resolved'}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <XCircle className="h-8 w-8 text-muted-foreground" />
          <div className="mt-2 text-2xl font-bold text-foreground">8</div>
          <div className="text-sm text-muted-foreground">{'Closed'}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Ticket</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="transition-colors hover:bg-muted/50">
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{ticket.subject}</div>
                  <div className="text-xs text-muted-foreground">{ticket.createdAt.toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{ticket.userEmail}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    ticket.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                    ticket.priority === 'medium' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    ticket.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                    ticket.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
                    ticket.status === 'open' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/management/tickets/${ticket.id}/options`}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

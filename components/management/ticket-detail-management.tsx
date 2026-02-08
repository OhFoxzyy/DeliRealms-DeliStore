'use client';

import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

interface TicketDetailManagementProps {
  ticketId: string;
}

export function TicketDetailManagement({ ticketId }: TicketDetailManagementProps) {
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('open');

  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/management/tickets"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{`Ticket #${ticketId}`}</h1>
          <p className="mt-1 text-muted-foreground">{'Manage ticket status and replies'}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{'Cannot access dashboard'}</h2>
            <p className="text-sm text-muted-foreground">
              {'I have been unable to access my dashboard for the past 2 days. Every time I try to log in, I get an error message...'}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">{'Reply to Ticket'}</h3>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Type your response..."
            />
            <div className="mt-4 flex justify-end">
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Send className="h-4 w-4" />
                {'Send Reply'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">{'Ticket Options'}</h3>
            <div className="space-y-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <button className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                {'Assign to Agent'}
              </button>
              <button className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                {'Mark as Spam'}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">{'User Info'}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground">user@example.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="text-foreground">Pro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

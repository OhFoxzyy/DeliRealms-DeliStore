"use client";

import React, { useState, useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Copy, ExternalLink, Trash2, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';

interface PreviewLink {
  id: string;
  token: string;
  password: string | null;
  expiresAt: string | null;
  accessCount: number;
  createdAt: string;
  url?: string;
}

export function PreviewLinksPanel({ pageId }: { pageId: string }) {
  const [links, setLinks] = useState<PreviewLink[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    if (!pageId) return;
    
    fetch(`/api/pages/${pageId}/preview`)
      .then((res) => res.json())
      .then((data) => {
        setLinks(data);
      })
      .catch(() => {});
  }, [pageId]);

  const handleCreate = async () => {
    try {
      const response = await fetch(`/api/pages/${pageId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password || undefined,
          expiresAt: expiresAt || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to create link');
      
      const link = await response.json();
      setLinks([link, ...links]);
      setDialogOpen(false);
      setPassword('');
      setExpiresAt('');
      toast.success('Preview link created');
    } catch (error) {
      toast.error('Failed to create preview link');
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleDelete = async (linkId: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/preview/${linkId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      
      setLinks(links.filter(l => l.id !== linkId));
      toast.success('Link deleted');
    } catch (error) {
      toast.error('Failed to delete link');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#fafafa]">Preview Links</h2>
            <p className="text-xs text-[#737373] mt-1">
              Shareable preview links for your page
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#171717] border-[#262626]">
              <DialogHeader>
                <DialogTitle className="text-[#fafafa]">Create Preview Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[#e5e5e5]">Password (optional)</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty for no password"
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-[#e5e5e5]">Expires At (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-3">
          {links.length === 0 ? (
            <div className="text-center py-8 text-[#737373]">
              <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No preview links created</p>
            </div>
          ) : (
            links.map((link) => (
              <div
                key={link.id}
                className="p-3 rounded-lg border border-[#262626] bg-[#171717]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {link.password && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                          Protected
                        </span>
                      )}
                      {link.expiresAt && new Date(link.expiresAt) > new Date() && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(link.expiresAt), 'MMM d, yyyy')}
                        </span>
                      )}
                      {link.expiresAt && new Date(link.expiresAt) <= new Date() && (
                        <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                          Expired
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[#e5e5e5] font-mono break-all mb-1">
                      {link.url || `${window.location.origin}/preview/${link.token}`}
                    </div>
                    <div className="text-xs text-[#737373]">
                      Created {format(new Date(link.createdAt), 'MMM d, yyyy')} • {link.accessCount} views
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopy(link.url || `${window.location.origin}/preview/${link.token}`)}
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(link.id)}
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

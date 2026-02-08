"use client";

import React, { useState, useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { UserPlus, Trash2, Shield, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';

interface Collaborator {
  id: string;
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export function CollaboratorsPanel({ pageId }: { pageId: string }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');

  useEffect(() => {
    if (!pageId) return;
    
    fetch(`/api/pages/${pageId}/collaborators`)
      .then((res) => res.json())
      .then((data) => {
        setCollaborators(data);
      })
      .catch(() => {});
  }, [pageId]);

  const handleAdd = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email');
      return;
    }

    try {
      // First, find user by email
      const userResponse = await fetch(`/api/users/find?email=${encodeURIComponent(email)}`);
      if (!userResponse.ok) {
        throw new Error('User not found');
      }
      const user = await userResponse.json();

      const response = await fetch(`/api/pages/${pageId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role }),
      });

      if (!response.ok) throw new Error('Failed to add collaborator');
      
      const collaborator = await response.json();
      setCollaborators([...collaborators, collaborator]);
      setDialogOpen(false);
      setEmail('');
      setRole('viewer');
      toast.success('Collaborator added');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add collaborator');
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/collaborators?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove');
      
      setCollaborators(collaborators.filter(c => c.userId !== userId));
      toast.success('Collaborator removed');
    } catch (error) {
      toast.error('Failed to remove collaborator');
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'viewer' | 'editor' | 'admin') => {
    try {
      const response = await fetch(`/api/pages/${pageId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update role');
      
      setCollaborators(collaborators.map(c => 
        c.userId === userId ? { ...c, role: newRole } : c
      ));
      toast.success('Role updated');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'editor':
        return <Edit className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'editor':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#262626] shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#fafafa]">Collaborators</h2>
            <p className="text-xs text-[#737373] mt-1">
              Manage page access and permissions
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#171717] border-[#262626]">
              <DialogHeader>
                <DialogTitle className="text-[#fafafa]">Add Collaborator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#e5e5e5]">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#e5e5e5]">Role</label>
                  <Select value={role} onValueChange={(v: any) => setRole(v)}>
                    <SelectTrigger className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer - Can view only</SelectItem>
                      <SelectItem value="editor">Editor - Can edit</SelectItem>
                      <SelectItem value="admin">Admin - Full access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-2">
          {collaborators.length === 0 ? (
            <div className="text-center py-8 text-[#737373]">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No collaborators yet</p>
            </div>
          ) : (
            collaborators.map((collab) => (
              <div
                key={collab.id}
                className="p-3 rounded-lg border border-[#262626] bg-[#171717] flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {collab.user.image && (
                    <img
                      src={collab.user.image}
                      alt={collab.user.name || 'User'}
                      className="w-8 h-8 rounded-full shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#fafafa] truncate">
                      {collab.user.name || collab.user.email || 'Unknown'}
                    </div>
                    <div className="text-xs text-[#737373] truncate">
                      {collab.user.email}
                    </div>
                  </div>
                  <Select
                    value={collab.role}
                    onValueChange={(v: any) => handleRoleChange(collab.userId, v)}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs bg-[#0f0f0f] border-[#262626]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemove(collab.userId)}
                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  category: string;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const statusColors = {
  planned: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  'in-progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  completed: 'bg-green-500/20 text-green-400 border-green-500/50',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
};

const priorityColors = {
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  medium: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  high: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export function RoadmapEditor() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'planned' as RoadmapItem['status'],
    priority: 'medium' as RoadmapItem['priority'],
    category: '',
    targetDate: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/roadmap');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch roadmap items:', error);
    }
  };

  const handleCreate = () => {
    setEditForm({
      title: '',
      description: '',
      status: 'planned',
      priority: 'medium',
      category: '',
      targetDate: '',
    });
    setSelectedItem(null);
    setIsEditing(true);
  };

  const handleEdit = (item: RoadmapItem) => {
    setEditForm({
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      category: item.category,
      targetDate: item.targetDate ? new Date(item.targetDate).toISOString().split('T')[0] : '',
    });
    setSelectedItem(item);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const url = selectedItem ? `/api/roadmap/${selectedItem.id}` : '/api/roadmap';
      const method = selectedItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          targetDate: editForm.targetDate || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success(selectedItem ? 'Roadmap item updated' : 'Roadmap item created');
      setIsEditing(false);
      fetchItems();
    } catch (error) {
      toast.error('Failed to save roadmap item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this roadmap item?')) return;

    try {
      const response = await fetch(`/api/roadmap/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Roadmap item deleted');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete roadmap item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#fafafa]">Roadmap Editor</h1>
          <p className="text-[#737373] mt-2">Plan and track feature development</p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Item
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-[#171717] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-[#fafafa]">Roadmap Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-[#262626] bg-[#0f0f0f] hover:bg-[#171717] transition-colors"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#fafafa] truncate">{item.title}</h3>
                        <p className="text-xs text-[#737373] mt-1 line-clamp-2">{item.description}</p>
                        {item.category && (
                          <p className="text-xs text-[#525252] mt-1">{item.category}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 mb-2">
                      <Badge className={statusColors[item.status]}>{item.status}</Badge>
                      <Badge className={priorityColors[item.priority]}>{item.priority}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        className="flex-1 border-[#262626]"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-8 text-[#737373]">
                    <p>No roadmap items yet</p>
                    <p className="text-xs mt-2">Click "New Item" to create one</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-[#171717] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-[#fafafa]">
              {isEditing ? (selectedItem ? 'Edit Item' : 'New Item') : 'Select an item'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#e5e5e5]">Title</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Dark mode support"
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e5e5e5]">Description</Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Implement dark mode across the entire application..."
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#e5e5e5]">Status</Label>
                    <Select value={editForm.status} onValueChange={(v: RoadmapItem['status']) => setEditForm({ ...editForm, status: v })}>
                      <SelectTrigger className="bg-[#0f0f0f] border-[#262626]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#e5e5e5]">Priority</Label>
                    <Select value={editForm.priority} onValueChange={(v: RoadmapItem['priority']) => setEditForm({ ...editForm, priority: v })}>
                      <SelectTrigger className="bg-[#0f0f0f] border-[#262626]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e5e5e5]">Category</Label>
                  <Input
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    placeholder="UI/UX"
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e5e5e5]">Target Date (Optional)</Label>
                  <Input
                    type="date"
                    value={editForm.targetDate}
                    onChange={(e) => setEditForm({ ...editForm, targetDate: e.target.value })}
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="border-[#262626]">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-[#737373]">
                <p>Select an item to edit or create a new one</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

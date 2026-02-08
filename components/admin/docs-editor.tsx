"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Plus, Edit, Trash2, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

interface DocArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function DocsEditor() {
  const [docs, setDocs] = useState<DocArticle[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocArticle | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    slug: '',
    content: '',
    isPublished: false,
  });

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const response = await fetch('/api/docs');
      if (response.ok) {
        const data = await response.json();
        setDocs(data);
      }
    } catch (error) {
      console.error('Failed to fetch docs:', error);
    }
  };

  const handleCreate = () => {
    setEditForm({
      title: '',
      slug: '',
      content: '',
      isPublished: false,
    });
    setSelectedDoc(null);
    setIsEditing(true);
  };

  const handleEdit = (doc: DocArticle) => {
    setEditForm({
      title: doc.title,
      slug: doc.slug,
      content: doc.content,
      isPublished: doc.isPublished,
    });
    setSelectedDoc(doc);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const url = selectedDoc ? `/api/docs/${selectedDoc.slug}` : '/api/docs';
      const method = selectedDoc ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success(selectedDoc ? 'Documentation updated' : 'Documentation created');
      setIsEditing(false);
      fetchDocs();
    } catch (error) {
      toast.error('Failed to save documentation');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this documentation?')) return;

    try {
      const response = await fetch(`/api/docs/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Documentation deleted');
      fetchDocs();
    } catch (error) {
      toast.error('Failed to delete documentation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#fafafa]">Documentation Editor</h1>
          <p className="text-[#737373] mt-2">Create and manage documentation articles</p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-[#171717] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-[#fafafa]">Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg border border-[#262626] bg-[#0f0f0f] hover:bg-[#171717] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#fafafa] truncate">{doc.title}</h3>
                        <p className="text-xs text-[#737373] truncate">/{doc.slug}</p>
                      </div>
                      {doc.isPublished && (
                        <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/50">
                          Published
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(doc)}
                        className="flex-1 border-[#262626]"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/docs/${doc.slug}`, '_blank')}
                        className="flex-1 border-[#262626]"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(doc.slug)}
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {docs.length === 0 && (
                  <div className="text-center py-8 text-[#737373]">
                    <p>No documentation articles yet</p>
                    <p className="text-xs mt-2">Click "New Article" to create one</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-[#171717] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-[#fafafa]">
              {isEditing ? (selectedDoc ? 'Edit Article' : 'New Article') : 'Select an article'}
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
                    placeholder="Getting Started"
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e5e5e5]">Slug</Label>
                  <Input
                    value={editForm.slug}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    placeholder="getting-started"
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e5e5e5]">Content (Markdown)</Label>
                  <Textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    placeholder="# Getting Started\n\nWelcome to our documentation..."
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5] font-mono"
                    rows={20}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={editForm.isPublished}
                    onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isPublished" className="text-[#e5e5e5]">Publish article</Label>
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
                <p>Select an article to edit or create a new one</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

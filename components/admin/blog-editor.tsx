"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Plus, Edit, Trash2, Eye, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function BlogEditor() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    isPublished: false,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    }
  };

  const handleCreate = () => {
    setEditForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: '',
      isPublished: false,
    });
    setSelectedPost(null);
    setIsEditing(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || '',
      isPublished: post.isPublished,
    });
    setSelectedPost(post);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const url = selectedPost ? `/api/blog/${selectedPost.slug}` : '/api/blog';
      const method = selectedPost ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success(selectedPost ? 'Blog post updated' : 'Blog post created');
      setIsEditing(false);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to save blog post');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Blog post deleted');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete blog post');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#fafafa]">Blog Editor</h1>
          <p className="text-[#737373] mt-2">Create and manage blog posts</p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-[#171717] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-[#fafafa]">Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-lg border border-[#262626] bg-[#0f0f0f] hover:bg-[#171717] transition-colors"
                  >
                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#fafafa] truncate">{post.title}</h3>
                        <p className="text-xs text-[#737373] truncate">/{post.slug}</p>
                        <p className="text-xs text-[#525252] mt-1 line-clamp-2">{post.excerpt}</p>
                      </div>
                      {post.isPublished && (
                        <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/50 shrink-0">
                          Published
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(post)}
                        className="flex-1 border-[#262626]"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                        className="flex-1 border-[#262626]"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(post.slug)}
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <div className="text-center py-8 text-[#737373]">
                    <p>No blog posts yet</p>
                    <p className="text-xs mt-2">Click "New Post" to create one</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-[#171717] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-[#fafafa]">
              {isEditing ? (selectedPost ? 'Edit Post' : 'New Post') : 'Select a post'}
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
                    placeholder="Introducing Our New Feature"
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e5e5e5]">Slug</Label>
                  <Input
                    value={editForm.slug}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    placeholder="introducing-new-feature"
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e5e5e5]">Excerpt</Label>
                  <Textarea
                    value={editForm.excerpt}
                    onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                    placeholder="A brief summary of your post..."
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e5e5e5]">Cover Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editForm.coverImage}
                      onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                      placeholder="https://..."
                      className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5]"
                    />
                    <Button variant="outline" className="border-[#262626]">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {editForm.coverImage && (
                    <img
                      src={editForm.coverImage}
                      alt="Cover preview"
                      className="w-full h-40 object-cover rounded"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e5e5e5]">Content (Markdown)</Label>
                  <Textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    placeholder="Write your blog post content here..."
                    className="bg-[#0f0f0f] border-[#262626] text-[#e5e5e5] font-mono"
                    rows={15}
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
                  <Label htmlFor="isPublished" className="text-[#e5e5e5]">Publish post</Label>
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
                <p>Select a post to edit or create a new one</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

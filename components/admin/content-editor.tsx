"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarkdownToolbar } from "./markdown-toolbar";
import { MarkdownPreview } from "./markdown-preview";
import { toast } from "sonner";
import { Save, Eye, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Box, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ContentEditorProps {
  type: "blog" | "docs" | "roadmap";
  id?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

const statusConfig = {
  planned: { icon: Clock, color: "text-muted-foreground" },
  in_progress: { icon: Clock, color: "text-orange-500" },
  completed: { icon: CheckCircle2, color: "text-green-500" },
  cancelled: { icon: XCircle, color: "text-red-500" },
};

export function ContentEditor({ type, id, onSave, onCancel }: ContentEditorProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [status, setStatus] = useState<"planned" | "in_progress" | "completed" | "cancelled">("planned");
  const [order, setOrder] = useState(0);
  const [eta, setEta] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchContent = async () => {
        try {
          let endpoint: string;
          if (type === "roadmap") {
            endpoint = `/api/roadmap/${id}`;
          } else {
            const listRes = await fetch(`/api/${type}`);
            if (!listRes.ok) throw new Error("Failed to load list");
            const list = await listRes.json();
            const item = list.find((i: any) => i.id === id);
            if (!item) throw new Error("Not found");
            endpoint = `/api/${type}/${item.slug}`;
          }
          const res = await fetch(endpoint);
          if (!res.ok) throw new Error("Failed to load");
          const data = await res.json();
          setTitle(data.title || "");
          setSlug(data.slug || "");
          setDescription(data.description || "");
          setContent(type === "roadmap" ? (data.description || "") : (data.content || ""));
          if (type === "roadmap") {
            setStatus(data.status || "planned");
            setOrder(data.order || 0);
            setEta(data.eta || "");
          } else {
            setPublished(data.published || false);
          }
        } catch (error) {
          toast.error("Failed to load content");
        } finally {
          setLoading(false);
        }
      };
      fetchContent();
    } else {
      setLoading(false);
    }
  }, [id, type]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!id && !slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    if (type !== "roadmap" && !slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setIsSaving(true);
    try {
      let endpoint: string;
      let method: string;
      
      if (type === "roadmap") {
        endpoint = id ? `/api/roadmap/${id}` : "/api/roadmap";
        method = id ? "PUT" : "POST";
      } else {
        if (id) {
          const listRes = await fetch(`/api/${type}`);
          if (!listRes.ok) throw new Error("Failed to load list");
          const list = await listRes.json();
          const item = list.find((i: any) => i.id === id);
          if (!item) throw new Error("Not found");
          endpoint = `/api/${type}/${item.slug}`;
        } else {
          endpoint = `/api/${type}`;
        }
        method = id ? "PUT" : "POST";
      }
      
      const body = type === "roadmap"
        ? { title, description: content, status, order, eta, slug: slug || undefined }
        : { title, slug, description, content, published };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to save" }));
        throw new Error(error.error || "Failed to save");
      }

      onSave();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (previewMode && !editMode) {
    if (type === "blog") {
      return (
        <div className="min-h-screen bg-black text-foreground">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 py-16">
            <article>
              <header className="mb-8 pb-8 border-b border-border/50">
                <div className="mb-4 text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <h1 className="text-5xl font-bold mb-6">{title || "Untitled"}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">POSTED BY</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">Author</span>
                    <Badge variant="secondary" className="text-xs">admin</Badge>
                  </div>
                </div>
              </header>
              <div className="prose prose-invert prose-lg max-w-none">
                <MarkdownPreview content={content} />
              </div>
            </article>
            <div className="mt-8 flex items-center gap-2">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (type === "docs") {
      return (
        <div className="min-h-screen bg-black text-foreground flex">
          <aside className="w-64 border-r border-border/50 p-6 overflow-y-auto">
            <div className="space-y-4 mb-8">
              <div className="p-3 border border-border/50 rounded-lg bg-card/30">
                <div className="flex items-center gap-2 mb-1">
                  <Box className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Using App Router</span>
                </div>
                <p className="text-xs text-muted-foreground">Features available in /app</p>
              </div>
              <div className="p-3 border border-border/50 rounded-lg bg-card/30">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Latest Version</span>
                </div>
                <p className="text-xs text-muted-foreground">16.1.6</p>
              </div>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-16">
              <article>
                <header className="mb-8 pb-8 border-b border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    <h1 className="text-5xl font-bold">{title || "Untitled"}</h1>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xl text-muted-foreground">
                    Welcome to the Next.js documentation!
                  </p>
                </header>
                <div className="prose prose-invert prose-lg max-w-none">
                  <MarkdownPreview content={content} />
                </div>
              </article>
              <div className="mt-8 flex items-center gap-2">
                <Button variant="outline" onClick={() => setPreviewMode(false)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </main>

          <aside className="w-64 border-l border-border/50 p-6">
            <div className="sticky top-6">
              <h3 className="text-sm font-semibold mb-4">On this page</h3>
            </div>
          </aside>
        </div>
      );
    }

    if (type === "roadmap") {
      const StatusIcon = statusConfig[status].icon;
      const statusColor = statusConfig[status].color;

      return (
        <div className="min-h-screen bg-black text-foreground">
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-16">
            <div className="border border-border/50 rounded-lg p-6 bg-card/30">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">
                      {title || "Untitled"}
                      {eta && (
                        <span className="text-lg font-normal text-muted-foreground ml-2">
                          - {eta}
                        </span>
                      )}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                    <div className="text-sm text-muted-foreground prose prose-invert prose-sm max-w-none">
                      <MarkdownPreview content={content} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="bg-card/30 border border-border/50 rounded-lg p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {id ? "Edit" : "Create"} {type === "blog" ? "Blog Post" : type === "docs" ? "Doc Page" : "Roadmap Item"}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              {previewMode ? <Edit className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter title..."
              className="bg-background border-border/50"
            />
          </div>

          {type !== "roadmap" && (
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-slug"
                className="bg-background border-border/50"
              />
            </div>
          )}

          {type === "blog" && (
            <div className="space-y-2">
              <Label>Description (for card preview)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description shown in blog card..."
                rows={4}
                className="bg-background border-border/50 font-mono text-sm"
              />
            </div>
          )}

          {type === "roadmap" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger className="bg-background border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    className="bg-background border-border/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ETA</Label>
                  <Input
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    placeholder="Q1 2024"
                    className="bg-background border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (optional, for detail page)</Label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="feature-slug"
                    className="bg-background border-border/50"
                  />
                </div>
              </div>
            </>
          )}

          {type !== "roadmap" && (
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published">Published</Label>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Content</Label>
              <MarkdownToolbar
                textareaId="content-editor"
                onInsert={(replacement) => {
                  const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
                  if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const newContent = content.substring(0, start) + replacement + content.substring(end);
                    setContent(newContent);
                    setTimeout(() => {
                      textarea.focus();
                      const newPos = start + replacement.length;
                      textarea.setSelectionRange(newPos, newPos);
                    }, 0);
                  }
                }}
              />
            </div>
            <Textarea
              id="content-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content in Markdown..."
              rows={20}
              className="font-mono text-sm bg-background border-border/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
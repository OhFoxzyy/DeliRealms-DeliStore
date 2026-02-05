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
import { Save, Eye, Edit, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Box, Shield, ChevronLeft, ChevronRight } from "lucide-react";

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

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!id && !slug) setSlug(generateSlug(value));
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
      if (type === "roadmap") {
        endpoint = id ? `/api/roadmap/${id}` : "/api/roadmap";
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
      }
      const method = id ? "PUT" : "POST";
      const body =
        type === "roadmap"
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
      <div className="flex items-center justify-center h-96 bg-black text-zinc-400">
        Loading...
      </div>
    );
  }

  const editorToolbar = (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-black px-4 py-3">
      <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-zinc-800 hover:bg-zinc-700">
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? "Saving..." : "Save"}
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel} className="text-zinc-400 hover:text-zinc-100">
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setPreviewMode(!previewMode)}
        className="text-zinc-400 hover:text-zinc-100"
      >
        {previewMode ? <Edit className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
        {previewMode ? "Edit" : "Preview"}
      </Button>
      <span className="h-4 w-px bg-zinc-700" />
      {type !== "roadmap" && (
        <>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-zinc-500">Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-8 w-40 bg-zinc-900 border-zinc-700 text-sm text-zinc-100"
              placeholder="url-slug"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="pub" checked={published} onCheckedChange={setPublished} />
            <Label htmlFor="pub" className="text-xs text-zinc-500">
              Published
            </Label>
          </div>
        </>
      )}
      {type === "roadmap" && (
        <>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-zinc-500">Status</Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger className="h-8 w-32 bg-zinc-900 border-zinc-700 text-zinc-100">
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
          <div className="flex items-center gap-2">
            <Label className="text-xs text-zinc-500">ETA</Label>
            <Input
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="h-8 w-24 bg-zinc-900 border-zinc-700 text-zinc-100"
              placeholder="Q1 2024"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-zinc-500">Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-8 w-32 bg-zinc-900 border-zinc-700 text-zinc-100"
              placeholder="optional"
            />
          </div>
        </>
      )}
    </div>
  );

  const darkEditorArea = (
    <div className="bg-black border border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between gap-2 p-2 border-b border-zinc-800 bg-zinc-900/80">
        <MarkdownToolbar
          textareaId="content-editor"
          onInsert={(replacement) => {
            const ta = document.getElementById("content-editor") as HTMLTextAreaElement;
            if (ta) {
              const start = ta.selectionStart;
              const end = ta.selectionEnd;
              const newContent = content.substring(0, start) + replacement + content.substring(end);
              setContent(newContent);
              setTimeout(() => {
                ta.focus();
                const newPos = start + replacement.length;
                ta.setSelectionRange(newPos, newPos);
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
        rows={18}
        className="min-h-[400px] w-full resize-y rounded-none border-0 bg-black p-4 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0"
      />
    </div>
  );

  if (previewMode) {
    if (type === "blog") {
      return (
        <div className="min-h-screen bg-black text-foreground">
          {editorToolbar}
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
                    <Badge variant="secondary" className="text-xs">
                      admin
                    </Badge>
                  </div>
                </div>
              </header>
              <div className="prose prose-invert prose-lg max-w-none">
                <MarkdownPreview content={content} />
              </div>
            </article>
          </div>
        </div>
      );
    }
    if (type === "docs") {
      return (
        <div className="min-h-screen bg-black text-foreground flex">
          {editorToolbar}
          <aside className="w-64 border-r border-border/50 p-6 overflow-y-auto shrink-0">
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
                  <p className="text-xl text-muted-foreground">Welcome to the Next.js documentation!</p>
                </header>
                <div className="prose prose-invert prose-lg max-w-none">
                  <MarkdownPreview content={content} />
                </div>
              </article>
            </div>
          </main>
          <aside className="w-64 border-l border-border/50 p-6 shrink-0">
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
          {editorToolbar}
          <div className="max-w-4xl mx-auto px-4 lg:px-6 py-16">
            <article>
              <header className="mb-8 pb-8 border-b border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <StatusIcon className={`h-6 w-6 ${statusColor}`} />
                  <span className="text-sm text-muted-foreground uppercase">
                    {status.replace("_", " ")}
                  </span>
                </div>
                <h1 className="text-5xl font-bold mb-4">
                  {title || "Untitled"}
                  {eta && <span className="text-2xl font-normal text-muted-foreground ml-3">- {eta}</span>}
                </h1>
              </header>
              <div className="prose prose-invert prose-lg max-w-none">
                <MarkdownPreview content={content} />
              </div>
            </article>
          </div>
        </div>
      );
    }
  }

  if (type === "blog") {
    return (
      <div className="min-h-screen bg-black text-foreground">
        {editorToolbar}
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
          <article>
            <header className="mb-6 pb-6 border-b border-zinc-800">
              <div className="mb-3 text-sm text-zinc-500">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Post title"
                className="text-4xl font-bold h-auto py-2 px-0 border-0 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex items-center gap-3 mt-4">
                <span className="text-sm text-zinc-500">POSTED BY</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-zinc-700 text-zinc-300">?</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-zinc-300">Author</span>
                  <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300">
                    admin
                  </Badge>
                </div>
              </div>
            </header>
            {type === "blog" && (
              <div className="mb-6">
                <Label className="text-xs text-zinc-500 mb-2 block">Card description (for list page)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description shown on blog cards..."
                  rows={3}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
            )}
            <div className="mt-6">
              <Label className="text-xs text-zinc-500 mb-2 block">Content</Label>
              {darkEditorArea}
            </div>
          </article>
        </div>
      </div>
    );
  }

  if (type === "docs") {
    return (
      <div className="min-h-screen bg-black text-foreground flex">
        {editorToolbar}
        <aside className="w-64 border-r border-zinc-800 p-6 overflow-y-auto shrink-0">
          <div className="space-y-4 mb-8">
            <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/50">
              <div className="flex items-center gap-2 mb-1">
                <Box className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-300">Using App Router</span>
              </div>
              <p className="text-xs text-zinc-500">Features available in /app</p>
            </div>
            <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/50">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-300">Latest Version</span>
              </div>
              <p className="text-xs text-zinc-500">16.1.6</p>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            <article>
              <header className="mb-6 pb-6 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                  <ChevronLeft className="h-5 w-5 text-zinc-500" />
                  <Input
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Doc title"
                    className="text-4xl font-bold h-auto py-2 px-0 border-0 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 flex-1"
                  />
                  <ChevronRight className="h-5 w-5 text-zinc-500" />
                </div>
                <p className="text-xl text-zinc-500">Welcome to the documentation!</p>
              </header>
              <div className="mt-6">
                <Label className="text-xs text-zinc-500 mb-2 block">Content</Label>
                {darkEditorArea}
              </div>
            </article>
          </div>
        </main>
        <aside className="w-64 border-l border-zinc-800 p-6 shrink-0">
          <div className="sticky top-6">
            <h3 className="text-sm font-semibold mb-4 text-zinc-400">On this page</h3>
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
        {editorToolbar}
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
          <article>
            <header className="mb-6 pb-6 border-b border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <StatusIcon className={`h-6 w-6 ${statusColor}`} />
                <span className="text-sm text-zinc-500 uppercase">{status.replace("_", " ")}</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Feature title"
                  className="text-4xl font-bold h-auto py-2 px-0 border-0 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 w-full max-w-md"
                />
                {eta && (
                  <span className="text-2xl font-normal text-zinc-500">- {eta}</span>
                )}
              </div>
            </header>
            <div className="mt-6">
              <Label className="text-xs text-zinc-500 mb-2 block">Description</Label>
              {darkEditorArea}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return null;
}

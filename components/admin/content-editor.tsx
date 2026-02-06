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

interface ContentEditorProps {
  type: "blog" | "docs" | "roadmap";
  id?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

const statusConfig = {
  planned: { icon: Clock, color: "text-[#737373]" },
  in_progress: { icon: Clock, color: "text-orange-500" },
  completed: { icon: CheckCircle2, color: "text-green-500" },
  cancelled: { icon: XCircle, color: "text-red-500" },
};

const bg = "bg-[#0a0a0a]";
const surface = "bg-[#171717]";
const border = "border-[#262626]";
const text = "text-[#e5e5e5]";
const textMuted = "text-[#737373]";
const textBright = "text-[#fafafa]";
const inputBg = "bg-[#0f0f0f]";

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
      <div className={`flex items-center justify-center h-96 ${bg} ${textMuted}`}>
        Loading...
      </div>
    );
  }

  const editorToolbar = (
    <div className={`sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b ${border} ${bg} px-4 py-3`}>
      <Button
        size="sm"
        onClick={handleSave}
        disabled={isSaving}
        className="bg-[#262626] hover:bg-[#404040] text-[#fafafa] border-0"
      >
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? "Saving..." : "Save"}
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel} className="text-[#737373] hover:text-[#fafafa] hover:bg-[#171717]">
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setPreviewMode(!previewMode)}
        className="text-[#737373] hover:text-[#fafafa] hover:bg-[#171717]"
      >
        {previewMode ? <Edit className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
        {previewMode ? "Edit" : "Preview"}
      </Button>
      <span className={`h-4 w-px ${surface}`} style={{ backgroundColor: "#262626" }} />
      {type !== "roadmap" && (
        <>
          <div className="flex items-center gap-2">
            <Label className={`text-xs ${textMuted}`}>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={`h-8 w-40 ${inputBg} ${border} text-sm ${textBright}`}
              placeholder="url-slug"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="pub" checked={published} onCheckedChange={setPublished} />
            <Label htmlFor="pub" className={`text-xs ${textMuted}`}>
              Published
            </Label>
          </div>
        </>
      )}
      {type === "roadmap" && (
        <>
          <div className="flex items-center gap-2">
            <Label className={`text-xs ${textMuted}`}>Status</Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger className={`h-8 w-32 ${inputBg} ${border} ${textBright}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={surface}>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className={`text-xs ${textMuted}`}>ETA</Label>
            <Input
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className={`h-8 w-24 ${inputBg} ${border} ${textBright}`}
              placeholder="Q1 2024"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className={`text-xs ${textMuted}`}>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={`h-8 w-32 ${inputBg} ${border} ${textBright}`}
              placeholder="optional"
            />
          </div>
        </>
      )}
    </div>
  );

  const darkEditorArea = (
    <div className={`${bg} border ${border} rounded-lg overflow-hidden`}>
      <div className={`flex items-center justify-between gap-2 p-2 border-b ${border} ${surface}`}>
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
        className="min-h-[400px] w-full resize-y rounded-none border-0 bg-[#0a0a0a] p-4 font-mono text-sm text-[#fafafa] placeholder:text-[#737373] focus-visible:ring-0"
      />
    </div>
  );

  if (previewMode) {
    if (type === "blog") {
      return (
        <div className={`min-h-screen ${bg} ${text}`}>
          {editorToolbar}
          <div className="max-w-4xl mx-auto px-4 lg:px-6 py-16">
            <article>
              <header className="mb-8 pb-8 border-b border-[#262626]">
                <div className={`mb-4 text-sm ${textMuted}`}>
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <h1 className="text-5xl font-bold mb-6 text-[#fafafa]">{title || "Untitled"}</h1>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${textMuted}`}>POSTED BY</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={surface}>?</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-[#e5e5e5]">Author</span>
                    <Badge variant="secondary" className="text-xs bg-[#262626] text-[#e5e5e5]">
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
        <div className={`min-h-screen ${bg} ${text} flex`}>
          {editorToolbar}
          <aside className="w-64 border-r border-[#262626] p-6 overflow-y-auto shrink-0 bg-[#0f0f0f]" />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-16">
              <article>
                <header className="mb-8 pb-8 border-b border-[#262626]">
                  <h1 className="text-5xl font-bold text-[#fafafa]">{title || "Untitled"}</h1>
                  <p className={`text-xl ${textMuted} mt-2`}>Welcome to the documentation!</p>
                </header>
                <div className="prose prose-invert prose-lg max-w-none">
                  <MarkdownPreview content={content} />
                </div>
              </article>
            </div>
          </main>
          <aside className="w-64 border-l border-[#262626] p-6 shrink-0 bg-[#0f0f0f]" />
        </div>
      );
    }
    if (type === "roadmap") {
      const StatusIcon = statusConfig[status].icon;
      const statusColor = statusConfig[status].color;
      return (
        <div className={`min-h-screen ${bg} ${text}`}>
          {editorToolbar}
          <div className="max-w-4xl mx-auto px-4 lg:px-6 py-16">
            <article>
              <header className="mb-8 pb-8 border-b border-[#262626]">
                <div className="flex items-center gap-3 mb-4">
                  <StatusIcon className={`h-6 w-6 ${statusColor}`} />
                  <span className={`text-sm ${textMuted} uppercase`}>{status.replace("_", " ")}</span>
                </div>
                <h1 className="text-5xl font-bold mb-4 text-[#fafafa]">
                  {title || "Untitled"}
                  {eta && <span className={`text-2xl font-normal ${textMuted} ml-3`}>- {eta}</span>}
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
      <div className={`min-h-screen ${bg} ${text}`}>
        {editorToolbar}
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
          <article>
            <header className={`mb-6 pb-6 border-b ${border}`}>
              <div className={`mb-3 text-sm ${textMuted}`}>
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
                className={`text-4xl font-bold h-auto py-2 px-0 border-0 bg-transparent ${textBright} placeholder:${textMuted} focus-visible:ring-0 focus-visible:ring-offset-0`}
              />
              <div className="flex items-center gap-3 mt-4">
                <span className={`text-sm ${textMuted}`}>POSTED BY</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#262626] text-[#a3a3a3]">?</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-[#e5e5e5]">Author</span>
                  <Badge variant="secondary" className={`text-xs ${surface} text-[#e5e5e5]`}>
                    admin
                  </Badge>
                </div>
              </div>
            </header>
            {type === "blog" && (
              <div className="mb-6">
                <Label className={`text-xs ${textMuted} mb-2 block`}>Card description (for list page)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description shown on blog cards..."
                  rows={3}
                  className={`${inputBg} ${border} ${textBright} placeholder:${textMuted}`}
                />
              </div>
            )}
            <div className="mt-6">
              <Label className={`text-xs ${textMuted} mb-2 block`}>Content</Label>
              {darkEditorArea}
            </div>
          </article>
        </div>
      </div>
    );
  }

  if (type === "docs") {
    return (
      <div className={`min-h-screen ${bg} ${text} flex`}>
        {editorToolbar}
        <aside className="w-52 shrink-0 border-r border-[#262626] bg-[#0f0f0f] flex flex-col">
          <div className="p-4 border-b border-[#262626] space-y-4">
            <div>
              <Label className={`text-xs ${textMuted} block mb-1`}>Title</Label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Doc title"
                className={`text-sm ${inputBg} ${border} ${textBright}`}
              />
            </div>
            <div>
              <Label className={`text-xs ${textMuted} block mb-1`}>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={`h-8 ${inputBg} ${border} ${textBright} text-sm`}
                placeholder="url-slug"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="doc-pub" checked={published} onCheckedChange={setPublished} />
              <Label htmlFor="doc-pub" className={`text-xs ${textMuted}`}>
                Published
              </Label>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            <div className="mt-6">
              <Label className={`text-xs ${textMuted} mb-2 block`}>Content</Label>
              {darkEditorArea}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (type === "roadmap") {
    const StatusIcon = statusConfig[status].icon;
    const statusColor = statusConfig[status].color;
    return (
      <div className={`min-h-screen ${bg} ${text}`}>
        {editorToolbar}
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
          <article>
            <header className={`mb-6 pb-6 border-b ${border}`}>
              <div className="flex items-center gap-3 mb-4">
                <StatusIcon className={`h-6 w-6 ${statusColor}`} />
                <span className={`text-sm ${textMuted} uppercase`}>{status.replace("_", " ")}</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Feature title"
                  className={`text-4xl font-bold h-auto py-2 px-0 border-0 bg-transparent ${textBright} placeholder:${textMuted} focus-visible:ring-0 w-full max-w-md`}
                />
                {eta && <span className={`text-2xl font-normal ${textMuted}`}>- {eta}</span>}
              </div>
            </header>
            <div className="mt-6">
              <Label className={`text-xs ${textMuted} mb-2 block`}>Description</Label>
              {darkEditorArea}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return null;
}

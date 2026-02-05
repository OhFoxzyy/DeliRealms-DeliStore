"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface DocPage {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DocsListProps {
  onEdit: (id: string) => void;
}

export function DocsList({ onEdit }: DocsListProps) {
  const [pages, setPages] = useState<DocPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/docs");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPages(data);
    } catch (error) {
      toast.error("Failed to load doc pages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const page = pages.find((p) => p.id === id);
      const res = await fetch(`/api/docs/${page?.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Page deleted");
      fetchPages();
    } catch (error) {
      toast.error("Failed to delete page");
    }
  };

  if (loading) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {pages.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          No doc pages yet. Create your first page!
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-lg divide-y divide-zinc-800 bg-black">
          {pages.map((page) => (
            <div key={page.id} className="p-4 hover:bg-zinc-900/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-zinc-100">{page.title}</h3>
                    <Badge variant={page.published ? "default" : "secondary"} className={page.published ? "bg-zinc-700" : "bg-zinc-800 text-zinc-400"}>
                      {page.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-500 mt-1">/{page.slug}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Updated {new Date(page.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100" onClick={() => window.open(`/docs/${page.slug}`, "_blank")}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100" onClick={() => onEdit(page.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(page.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

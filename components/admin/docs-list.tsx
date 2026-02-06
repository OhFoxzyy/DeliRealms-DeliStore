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
    return <div className="text-[#737373]">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {pages.length === 0 ? (
        <div className="text-center py-12 text-[#737373]">
          No doc pages yet. Create your first page!
        </div>
      ) : (
        <div className="border border-[#262626] rounded-lg divide-y divide-[#262626] bg-[#0f0f0f]">
          {pages.map((page) => (
            <div key={page.id} className="p-4 hover:bg-[#171717] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[#fafafa]">{page.title}</h3>
                    <Badge variant={page.published ? "default" : "secondary"} className={page.published ? "bg-[#404040] text-[#fafafa]" : "bg-[#262626] text-[#a3a3a3]"}>
                      {page.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#737373] mt-1">/{page.slug}</p>
                  <p className="text-xs text-[#737373] mt-1">
                    Updated {new Date(page.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-[#e5e5e5] hover:text-[#fafafa] hover:bg-[#262626]" onClick={() => window.open(`/docs/${page.slug}`, "_blank")}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[#e5e5e5] hover:text-[#fafafa] hover:bg-[#262626]" onClick={() => onEdit(page.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(page.id)} className="text-red-400 hover:text-red-300 hover:bg-[#262626]">
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

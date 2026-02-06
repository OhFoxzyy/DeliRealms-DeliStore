"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogListProps {
  onEdit: (id: string) => void;
}

export function BlogList({ onEdit }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blog");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const post = posts.find((p) => p.id === id);
      const res = await fetch(`/api/blog/${post?.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Post deleted");
      fetchPosts();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  if (loading) {
    return <div className="text-[#737373]">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-12 text-[#737373]">
          No blog posts yet. Create your first post!
        </div>
      ) : (
        <div className="border border-[#262626] rounded-lg divide-y divide-[#262626] bg-[#0f0f0f]">
          {posts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-[#171717] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[#fafafa]">{post.title}</h3>
                    <Badge variant={post.published ? "default" : "secondary"} className={post.published ? "bg-[#404040] text-[#fafafa]" : "bg-[#262626] text-[#a3a3a3]"}>
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#737373] mt-1">/{post.slug}</p>
                  <p className="text-xs text-[#737373] mt-1">
                    Updated {new Date(post.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-[#e5e5e5] hover:text-[#fafafa] hover:bg-[#262626]" onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[#e5e5e5] hover:text-[#fafafa] hover:bg-[#262626]" onClick={() => onEdit(post.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-300 hover:bg-[#262626]">
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

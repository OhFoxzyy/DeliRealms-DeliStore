"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface RoadmapListProps {
  onEdit: (id: string) => void;
}

const statusColors = {
  planned: "secondary",
  in_progress: "default",
  completed: "default",
  cancelled: "destructive",
} as const;

const statusLabels = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function RoadmapList({ onEdit }: RoadmapListProps) {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/roadmap");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data.sort((a: RoadmapItem, b: RoadmapItem) => a.order - b.order));
    } catch (error) {
      toast.error("Failed to load roadmap items");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`/api/roadmap/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Item deleted");
      fetchItems();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  if (loading) {
    return <div className="text-[#737373]">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-12 text-[#737373]">
          No roadmap items yet. Create your first item!
        </div>
      ) : (
        <div className="border border-[#262626] rounded-lg divide-y divide-[#262626] bg-[#0f0f0f]">
          {items.map((item) => (
            <div key={item.id} className="p-4 hover:bg-[#171717] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[#fafafa]">{item.title}</h3>
                    <Badge variant={statusColors[item.status] as any} className="bg-[#262626] text-[#a3a3a3] border-[#404040]">
                      {statusLabels[item.status]}
                    </Badge>
                    <span className="text-xs text-[#737373]">Order: {item.order}</span>
                  </div>
                  <p className="text-sm text-[#737373] mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-[#737373] mt-1">
                    Updated {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-[#e5e5e5] hover:text-[#fafafa] hover:bg-[#262626]" onClick={() => onEdit(item.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 hover:bg-[#262626]">
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

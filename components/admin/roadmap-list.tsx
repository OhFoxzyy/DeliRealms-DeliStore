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
    return <div className="text-zinc-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          No roadmap items yet. Create your first item!
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-lg divide-y divide-zinc-800 bg-black">
          {items.map((item) => (
            <div key={item.id} className="p-4 hover:bg-zinc-900/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-zinc-100">{item.title}</h3>
                    <Badge variant={statusColors[item.status] as any} className="bg-zinc-800 text-zinc-400 border-zinc-700">
                      {statusLabels[item.status]}
                    </Badge>
                    <span className="text-xs text-zinc-500">Order: {item.order}</span>
                  </div>
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Updated {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100" onClick={() => onEdit(item.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300">
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

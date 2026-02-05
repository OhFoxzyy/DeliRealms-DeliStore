"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContentEditor } from "./content-editor";
import { BlogList } from "./blog-list";
import { DocsList } from "./docs-list";
import { RoadmapList } from "./roadmap-list";
import { toast } from "sonner";

export function AdminContentManager() {
  const [activeTab, setActiveTab] = useState<"blog" | "docs" | "roadmap">("blog");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsCreating(false);
  };

  const handleSave = () => {
    setIsCreating(false);
    setEditingId(null);
    setRefreshKey((k) => k + 1);
    toast.success("Saved successfully");
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Content Management</h1>
            <p className="text-zinc-500 mt-1">Manage blog posts, documentation, and roadmap items</p>
          </div>
          {(isCreating || editingId) && (
            <Button variant="outline" onClick={handleCancel} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancel
            </Button>
          )}
          {!isCreating && !editingId && (
            <Button onClick={handleCreate} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100">
              <Plus className="mr-2 h-4 w-4" />
              Create {activeTab === "blog" ? "Post" : activeTab === "docs" ? "Page" : "Item"}
            </Button>
          )}
        </div>

        {(isCreating || editingId) ? (
          <ContentEditor
            type={activeTab}
            id={editingId}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="bg-zinc-900/80 border-zinc-800">
              <TabsTrigger value="blog" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">Blog</TabsTrigger>
              <TabsTrigger value="docs" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">Docs</TabsTrigger>
              <TabsTrigger value="roadmap" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">Roadmap</TabsTrigger>
            </TabsList>

            <TabsContent value="blog" className="mt-6">
              <BlogList key={refreshKey} onEdit={handleEdit} />
            </TabsContent>

            <TabsContent value="docs" className="mt-6">
              <DocsList key={refreshKey} onEdit={handleEdit} />
            </TabsContent>

            <TabsContent value="roadmap" className="mt-6">
              <RoadmapList key={refreshKey} onEdit={handleEdit} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

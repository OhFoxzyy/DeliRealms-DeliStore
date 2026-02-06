"use client";

import { useState } from "react";
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
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#fafafa]">Content Management</h1>
            <p className="text-[#737373] mt-1">Manage blog posts, documentation, and roadmap items</p>
          </div>
          {(isCreating || editingId) && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-[#262626] bg-transparent text-[#e5e5e5] hover:bg-[#171717] hover:text-[#fafafa]"
            >
              Cancel
            </Button>
          )}
          {!isCreating && !editingId && (
            <Button
              onClick={handleCreate}
              className="bg-[#262626] hover:bg-[#404040] text-[#fafafa] border-0"
            >
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
            <TabsList className="bg-[#0f0f0f] border border-[#262626] p-1 rounded-lg">
              <TabsTrigger
                value="blog"
                className="data-[state=active]:bg-[#171717] data-[state=active]:text-[#fafafa] text-[#a3a3a3] rounded-md px-4"
              >
                Blog
              </TabsTrigger>
              <TabsTrigger
                value="docs"
                className="data-[state=active]:bg-[#171717] data-[state=active]:text-[#fafafa] text-[#a3a3a3] rounded-md px-4"
              >
                Docs
              </TabsTrigger>
              <TabsTrigger
                value="roadmap"
                className="data-[state=active]:bg-[#171717] data-[state=active]:text-[#fafafa] text-[#a3a3a3] rounded-md px-4"
              >
                Roadmap
              </TabsTrigger>
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

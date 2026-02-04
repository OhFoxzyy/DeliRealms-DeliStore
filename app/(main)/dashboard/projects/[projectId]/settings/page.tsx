"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  subdomain: string | null;
  customDomain: string | null;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setProject(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setSubdomain(data.subdomain || "");
      } catch {
        toast.error("Failed to load project");
        router.push("/dashboard/projects");
      }
    }
    fetchProject();
  }, [projectId, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, subdomain: subdomain || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      toast.success("Settings saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!project) return null;

  return (
    <div className="container py-8 px-4 max-w-2xl">
      <Link
        href={`/dashboard/projects/${projectId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to project
      </Link>

      <h1 className="text-2xl font-bold mb-2">Project Settings</h1>
      <p className="text-muted-foreground mb-8">
        Update your project details. Subdomain is used for deployment URL (e.g. mysubdomain.vixle.app).
      </p>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Project name and description</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Project"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="my-store"
                />
                <span className="text-sm text-muted-foreground">.vixle.app</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Required for deployment. Letters, numbers, and hyphens only.
              </p>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

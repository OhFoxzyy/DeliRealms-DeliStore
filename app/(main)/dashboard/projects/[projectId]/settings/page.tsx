"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Globe, 
  Eye, 
  EyeOff, 
  Rocket, 
  Settings, 
  Download, 
  Upload as UploadIcon,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { uploadFile, getCDNUrl } from "@/lib/cdn/upload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  description: string | null;
  subdomain: string | null;
  customDomain: string | null;
  isPublished: boolean;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [autoDeploy, setAutoDeploy] = useState(false);
  const [deployBranch, setDeployBranch] = useState("main");
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [installCommand, setInstallCommand] = useState("npm install");
  const [nodeVersion, setNodeVersion] = useState("18");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
        setCustomDomain(data.customDomain || "");
        setIsPublished(data.isPublished || false);
        setLogo(data.logo || null);
      } catch {
        toast.error("Failed to load project");
        router.push("/dashboard/projects");
      }
    }
    fetchProject();
  }, [projectId, router]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const result = await uploadFile(file, {
        onProgress: (progress) => console.log("Upload progress:", progress),
      });

      if (result.success && result.file) {
        setLogo(result.file.url);
        toast.success("Logo uploaded successfully");
      } else {
        toast.error(result.error || "Failed to upload logo");
      }
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          description, 
          subdomain: subdomain || null,
          customDomain: customDomain || null,
          isPublished,
          logo,
        }),
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

  const handleSaveDeploymentSettings = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/deployment-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoDeploy,
          deployBranch,
          buildCommand,
          installCommand,
          nodeVersion,
        }),
      });
      if (res.ok) {
        toast.success("Deployment settings saved");
      } else {
        throw new Error("Failed to save deployment settings");
      }
    } catch (error) {
      toast.error("Failed to save deployment settings");
    }
  };

  const handleExportProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/export`);
      if (!res.ok) throw new Error("Failed to export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}-export.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Project exported successfully");
    } catch (error) {
      toast.error("Failed to export project");
    }
  };

  const handleDeleteProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Project deleted");
        router.push("/dashboard");
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const copyDomain = (domain: string) => {
    navigator.clipboard.writeText(domain);
    toast.success("Domain copied to clipboard");
  };

  if (!project) return null;

  return (
    <div className="container py-8 px-4 max-w-4xl">
      <Link
        href={`/dashboard/projects/${projectId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to project
      </Link>

      <h1 className="text-3xl font-bold mb-2">Project Settings</h1>
      <p className="text-muted-foreground mb-8">
        Manage your project configuration and deployment settings
      </p>

      <div className="space-y-6">
        {/* General Settings */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Project name, description, and branding</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border-2 border-border">
                    {logo ? (
                      <img
                        src={getCDNUrl(logo)}
                        alt="Project logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {logo && (
                    <button
                      type="button"
                      onClick={() => setLogo(null)}
                      className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="logo">Project Logo</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                    </Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, or SVG. Max 5MB. Recommended: 512x512px
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Project"
                  className="bg-input border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of your project"
                  rows={3}
                  className="bg-input border-border/50"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published">Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    {isPublished ? "Project is published and accessible" : "Project is private"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isPublished ? "default" : "secondary"}>
                    {isPublished ? "Published" : "Private"}
                  </Badge>
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Domain Settings */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Domains</CardTitle>
            </div>
            <CardDescription>Configure your project domains</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="my-store"
                  className="bg-input border-border/50"
                />
                <span className="text-sm text-muted-foreground">.vixle.app</span>
                {subdomain && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => copyDomain(`${subdomain}.vixle.app`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Required for deployment. Letters, numbers, and hyphens only.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="customDomain">Custom Domain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="customDomain"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="example.com"
                  className="bg-input border-border/50"
                />
                {customDomain && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => copyDomain(customDomain)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Add a custom domain to your project. Configure DNS records as instructed.
              </p>
              {customDomain && (
                <div className="mt-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">DNS Configuration Required:</p>
                      <p>Add a CNAME record: <code className="bg-background px-1 rounded">{customDomain}</code> → <code className="bg-background px-1 rounded">{subdomain || "your-subdomain"}.vixle.app</code></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deployment Settings */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              <CardTitle>Deployment Settings</CardTitle>
            </div>
            <CardDescription>Configure automatic deployments and build settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoDeploy">Auto Deploy</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically deploy when changes are pushed to the selected branch
                </p>
              </div>
              <Switch
                id="autoDeploy"
                checked={autoDeploy}
                onCheckedChange={setAutoDeploy}
              />
            </div>

            {autoDeploy && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="deployBranch">Deploy Branch</Label>
                  <Select value={deployBranch} onValueChange={setDeployBranch}>
                    <SelectTrigger className="bg-input border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">main</SelectItem>
                      <SelectItem value="master">master</SelectItem>
                      <SelectItem value="develop">develop</SelectItem>
                      <SelectItem value="production">production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nodeVersion">Node.js Version</Label>
                <Select value={nodeVersion} onValueChange={setNodeVersion}>
                  <SelectTrigger className="bg-input border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="18">18</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="22">22</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="installCommand">Install Command</Label>
                <Input
                  id="installCommand"
                  value={installCommand}
                  onChange={(e) => setInstallCommand(e.target.value)}
                  placeholder="npm install"
                  className="bg-input border-border/50 font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buildCommand">Build Command</Label>
                <Input
                  id="buildCommand"
                  value={buildCommand}
                  onChange={(e) => setBuildCommand(e.target.value)}
                  placeholder="npm run build"
                  className="bg-input border-border/50 font-mono text-sm"
                />
              </div>
            </div>

            <Button onClick={handleSaveDeploymentSettings} variant="outline">
              Save Deployment Settings
            </Button>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Track your project performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics">Enable Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Track page views, user interactions, and performance metrics
                </p>
              </div>
              <Switch
                id="analytics"
                checked={analyticsEnabled}
                onCheckedChange={setAnalyticsEnabled}
              />
            </div>
            {analyticsEnabled && (
              <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Analytics tracking is active</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export/Import */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Export & Import</CardTitle>
            <CardDescription>Backup or transfer your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export Project</p>
                <p className="text-sm text-muted-foreground">
                  Download a JSON backup of your project
                </p>
              </div>
              <Button variant="outline" onClick={handleExportProject}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Import Project</p>
                <p className="text-sm text-muted-foreground">
                  Import a project from a JSON file
                </p>
              </div>
              <Button variant="outline" disabled>
                <UploadIcon className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-card/50 border-border/50 border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    "{name}" and all associated pages, deployments, and data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProject}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

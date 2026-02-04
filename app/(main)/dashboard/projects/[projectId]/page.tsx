"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Globe, 
  Settings, 
  Key, 
  Rocket, 
  FileText, 
  MoreHorizontal,
  ExternalLink,
  GitBranch,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string | null;
  subdomain: string | null;
  customDomain: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  pages: Array<{
    id: string;
    name: string;
    slug: string;
    isHome: boolean;
    updatedAt: string;
  }>;
  deployments: Array<{
    id: string;
    status: string;
    url: string | null;
    createdAt: string;
  }>;
}

const tabs = [
  { id: "overview", label: "Overview", href: "" },
  { id: "pages", label: "Pages", href: "/pages" },
  { id: "deployments", label: "Deployments", href: "/deployments" },
  { id: "domains", label: "Domains", href: "/domains" },
  { id: "env-vars", label: "Environment Variables", href: "/env-vars" },
  { id: "settings", label: "Settings", href: "/settings" },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Project not found");
            router.push("/dashboard/projects");
            return;
          }
          throw new Error("Failed to fetch project");
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        toast.error("Failed to load project");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId, router]);

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/deploy`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Deployment failed");
      const data = await response.json();
      toast.success("Deployment started successfully");
      setProject((prev) => prev ? {
        ...prev,
        deployments: [data.deployment, ...prev.deployments],
      } : null);
    } catch (error) {
      toast.error("Failed to start deployment");
      console.error(error);
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-6 px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex gap-2 border-b border-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const latestDeployment = project.deployments[0];
  const projectUrl = project.customDomain 
    ? `https://${project.customDomain}` 
    : project.subdomain 
    ? `https://${project.subdomain}.delistore.app` 
    : null;

  return (
    <div className="min-h-screen">
      {/* Project Header */}
      <div className="border-b border-border backdrop-blur">
        <div className="container px-4 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-lime-500 to-lime-600">
                <span className="text-lg font-bold text-white">
                  {project.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold">{project.name}</h1>
                  <Badge variant={project.isPublished ? "default" : "secondary"}>
                    {project.isPublished ? "Live" : "Draft"}
                  </Badge>
                </div>
                {projectUrl && (
                  <a 
                    href={projectUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {projectUrl.replace("https://", "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/projects/${projectId}/settings`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button 
                size="sm" 
                onClick={handleDeploy} 
                disabled={deploying || project.pages.length === 0}
              >
                <Rocket className="mr-2 h-4 w-4" />
                {deploying ? "Deploying..." : "Deploy"}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="container px-4">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={`/dashboard/projects/${projectId}${tab.href}`}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                  tab.id === "overview"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6 px-4">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pages Section */}
            <Card className="bg-black">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pages</CardTitle>
                  <CardDescription>
                    {project.pages.length} page{project.pages.length !== 1 ? "s" : ""} in this project
                  </CardDescription>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/dashboard/projects/${projectId}/pages/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Page
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {project.pages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No pages yet</p>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/projects/${projectId}/pages/new`}>
                        Create your first page
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {project.pages.map((page) => (
                      <Link
                        key={page.id}
                        href={`/dashboard/projects/${projectId}/pages/${page.id}/edit`}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{page.name}</p>
                            <p className="text-sm text-muted-foreground">/{page.slug}</p>
                          </div>
                          {page.isHome && (
                            <Badge variant="outline" className="text-xs">Home</Badge>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Deployments */}
            <Card className="bg-black">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Deployments</CardTitle>
                  <CardDescription>Latest deployment activity</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/projects/${projectId}/deployments`}>
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {project.deployments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Rocket className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No deployments yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {project.deployments.slice(0, 5).map((deployment) => (
                      <div
                        key={deployment.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            deployment.status === "ready" ? "bg-green-500" :
                            deployment.status === "building" ? "bg-yellow-500 animate-pulse" :
                            deployment.status === "error" ? "bg-red-500" : "bg-muted"
                          )} />
                          <div>
                            <p className="font-medium text-sm">{deployment.status}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(deployment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {deployment.url && (
                          <a
                            href={deployment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-black">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/dashboard/projects/${projectId}/domains`}>
                    <Globe className="mr-2 h-4 w-4" />
                    Manage Domains
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/dashboard/projects/${projectId}/env-vars`}>
                    <Key className="mr-2 h-4 w-4" />
                    Environment Variables
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/dashboard/projects/${projectId}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Project Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card className="bg-black">
              <CardHeader>
                <CardTitle className="text-base">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pages</span>
                  <span>{project.pages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Deployments</span>
                  <span>{project.deployments.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

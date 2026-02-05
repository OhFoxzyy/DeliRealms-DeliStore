"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExternalLink, RefreshCw, RotateCcw, Trash2, MoreVertical, Play, Clock, Globe, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DeploymentDetail {
  id: string;
  status: string;
  url: string | null;
  containerId: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    subdomain: string | null;
    customDomain: string | null;
  };
}

interface LogsResponse {
  status: string;
  lines: string[];
}

interface ParsedLogLine {
  timestamp?: string;
  action: string;
  isError: boolean;
  isWarning: boolean;
  isSuccess: boolean;
  isBackend: boolean;
  raw: string;
}

export default function DeploymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const deploymentId = params.deploymentId as string;

  const [deployment, setDeployment] = useState<DeploymentDetail | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) {
          throw new Error("Failed to load deployment");
        }
        const project = await res.json();
        const found = (project.deployments as DeploymentDetail[]).find(
          (d) => d.id === deploymentId,
        );
        if (found) {
          setDeployment({ ...found, project });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [deploymentId, projectId]);

  const fetchLogs = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/deployments/${deploymentId}/logs`,
      );
      if (!res.ok) {
        throw new Error("Failed to load logs");
      }
      const data: LogsResponse = await res.json();
      setLogs(data.lines ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Poll logs every second
  useEffect(() => {
    if (!deployment) return;

    // Initial fetch
    fetchLogs();

    // Poll every second for live updates
    pollIntervalRef.current = setInterval(() => {
      fetchLogs();
    }, 1000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [deployment, deploymentId, projectId]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const parseLogLine = (line: string): ParsedLogLine => {
    const trimmed = line.trim();
    
    // Check for backend logs [VIXLE]
    if (trimmed.startsWith('[VIXLE]') || trimmed.startsWith('[v0]')) {
      const action = trimmed.replace(/^\[(VIXLE|v0)\]\s*/, '');
      return {
        action,
        isError: /error|failed|fail/i.test(action),
        isWarning: /warning|warn/i.test(action),
        isSuccess: /success|completed|ready/i.test(action),
        isBackend: true,
        raw: trimmed,
      };
    }

    // Check for timestamp format: HH:MM:SS.mmm  (ACTION)
    const timestampMatch = trimmed.match(/^(\d{2}:\d{2}:\d{2}\.\d{3})\s+(.+)$/);
    if (timestampMatch) {
      const [, timestamp, action] = timestampMatch;
      return {
        timestamp,
        action,
        isError: /error|failed|fail/i.test(action),
        isWarning: /warning|warn/i.test(action),
        isSuccess: /success|compiled|ready|completed/i.test(action),
        isBackend: false,
        raw: trimmed,
      };
    }

    // Default parsing
    return {
      action: trimmed,
      isError: /error|failed|fail/i.test(trimmed),
      isWarning: /warning|warn/i.test(trimmed),
      isSuccess: /success|compiled|ready|completed/i.test(trimmed),
      isBackend: false,
      raw: trimmed,
    };
  };

  const formatLogLine = (line: ParsedLogLine, index: number) => {
    const colorClass = line.isError
      ? 'text-red-400'
      : line.isWarning
      ? 'text-yellow-400'
      : line.isSuccess
      ? 'text-lime-400'
      : 'text-neutral-300';

    return (
      <div key={index} className={cn('font-mono text-xs', colorClass)}>
        {line.isBackend ? (
          <span>
            <span className="text-blue-400">[VIXLE]</span> {line.action}
          </span>
        ) : line.timestamp ? (
          <span>
            <span className="text-neutral-500">{line.timestamp}</span> {line.action}
          </span>
        ) : (
          <span>{line.raw}</span>
        )}
      </div>
    );
  };

  const handleRedeploy = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/deploy`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to redeploy');
      toast.success('Redeployment started');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to redeploy');
    }
  };

  const handleRollback = async () => {
    if (!confirm('Are you sure you want to rollback to this deployment?')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/deployments/${deploymentId}/rollback`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to rollback');
      toast.success('Rollback initiated');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to rollback');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deployment? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/deployments/${deploymentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Deployment deleted');
      router.push(`/dashboard/projects/${projectId}/deployments`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  if (isLoading || !deployment) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[320px] w-full" />
      </div>
    );
  }

  const isActive = deployment.status === "active" || deployment.status === "ready" || deployment.status === "deployed";
  const buildDuration = deployment.createdAt && deployment.updatedAt
    ? Math.round((new Date(deployment.updatedAt).getTime() - new Date(deployment.createdAt).getTime()) / 1000)
    : 0;
  const timeAgo = deployment.createdAt
    ? Math.round((Date.now() - new Date(deployment.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const domains = [];
  if (deployment.project?.subdomain) {
    domains.push(`${deployment.project.subdomain}.vixle.app`);
  }
  if (deployment.project?.customDomain) {
    domains.push(deployment.project.customDomain);
  }
  if (deployment.url) {
    domains.push(deployment.url.replace('https://', '').replace('http://', ''));
  }

  const parsedLogs = logs.map(parseLogLine);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              Deployment Details
            </h1>
            <Badge
              variant={
                isActive
                  ? "default"
                  : deployment.status === "failed"
                  ? "destructive"
                  : "secondary"
              }
            >
              {deployment.status === 'active' ? 'Latest' : deployment.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Created {new Date(deployment.createdAt).toLocaleDateString()} • {timeAgo}d ago
          </p>
        </div>
        <div className="flex items-center gap-2">
          {deployment.url && (
            <Button asChild variant="outline" size="sm" className="cursor-pointer">
              <a
                href={deployment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit
              </a>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRedeploy} className="cursor-pointer">
                <Play className="mr-2 h-4 w-4" />
                Redeploy
              </DropdownMenuItem>
              {isActive && (
                <DropdownMenuItem onClick={handleRollback} className="cursor-pointer">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Rollback
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild variant="ghost" size="sm" className="cursor-pointer">
            <Link href={`/dashboard/projects/${projectId}/deployments`} className="cursor-pointer">
              Back
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Deployment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={isActive ? 'default' : deployment.status === 'failed' ? 'destructive' : 'secondary'}>
                    {deployment.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">{isActive ? 'Latest' : 'Previous'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Environment</span>
                  <Badge variant="outline">Production</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Duration
                  </span>
                  <span>{buildDuration}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(deployment.createdAt).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Domains
                </CardTitle>
              </CardHeader>
              <CardContent>
                {domains.length > 0 ? (
                  <div className="space-y-2">
                    {domains.map((domain, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded border border-border">
                        <span className="text-sm font-mono">{domain}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer" asChild>
                          <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No domains configured</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card className="bg-black text-white border border-border">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">
                  Build & runtime logs
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Live
                </Badge>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 border-white/10 text-white cursor-pointer"
                onClick={fetchLogs}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={cn(
                    "h-3 w-3",
                    isRefreshing && "animate-spin",
                  )}
                />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 w-full border-t border-white/10 bg-black/90" ref={scrollRef}>
                <div className="p-4 space-y-1">
                  {parsedLogs.length === 0 ? (
                    <span className="text-neutral-500 text-xs">
                      {deployment.status === 'building' ? 'Waiting for logs...' : 'No logs available yet.'}
                    </span>
                  ) : (
                    parsedLogs.map((line, index) => formatLogLine(line, index))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Website Preview</CardTitle>
              <CardDescription>Live preview of your deployed website</CardDescription>
            </CardHeader>
            <CardContent>
              {deployment.url ? (
                <div className="border border-border rounded-lg overflow-hidden bg-black">
                  <div className="p-2 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={isActive ? 'default' : 'secondary'}>
                        {isActive ? 'Running' : 'Offline'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Preview (non-interactive)
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="cursor-pointer" asChild>
                      <a href={deployment.url} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open in new tab
                      </a>
                    </Button>
                  </div>
                  <iframe
                    src={deployment.url}
                    className="w-full h-[600px]"
                    style={{ 
                      pointerEvents: 'none',
                      overflow: 'hidden',
                      border: 'none',
                    }}
                    scrolling="no"
                    title="Deployment Preview"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[600px] border border-border rounded-lg">
                  <p className="text-muted-foreground">No preview available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

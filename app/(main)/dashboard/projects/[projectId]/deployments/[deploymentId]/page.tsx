"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeploymentDetail {
  id: string;
  status: string;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LogsResponse {
  status: string;
  lines: string[];
}

export default function DeploymentDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const deploymentId = params.deploymentId as string;

  const [deployment, setDeployment] = useState<DeploymentDetail | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
          setDeployment(found);
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

  useEffect(() => {
    void fetchLogs();
  }, []);

  if (isLoading || !deployment) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[320px] w-full" />
      </div>
    );
  }

  const isActive = deployment.status === "active" || deployment.status === "ready";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              Deployment <span className="font-mono text-sm">{deployment.id}</span>
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
              {deployment.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Created {new Date(deployment.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {deployment.url && (
            <Button asChild variant="outline" size="sm">
              <a
                href={deployment.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open deployment
              </a>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/projects/${projectId}/deployments`}>
              Back to deployments
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logs" className="w-full">
        <TabsList>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="logs" className="mt-4">
          <Card className="bg-black text-white border border-border">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
              <CardTitle className="text-sm font-medium">
                Build & runtime logs
              </CardTitle>
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 border-white/10 text-white"
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
              <ScrollArea className="h-80 w-full border-t border-white/10 bg-black/90">
                <pre className="text-xs font-mono p-4 whitespace-pre-wrap">
                  {logs.length === 0 ? (
                    <span className="text-neutral-500">
                      No logs available yet.
                    </span>
                  ) : (
                    logs.map((line, index) => (
                      <span key={index} className="block">
                        {line}
                      </span>
                    ))
                  )}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="capitalize">{deployment.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Created</span>
                <span>{new Date(deployment.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last updated</span>
                <span>{new Date(deployment.updatedAt).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


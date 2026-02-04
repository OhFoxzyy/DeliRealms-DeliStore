"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Rocket, ExternalLink, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Deployment {
  id: string;
  status: string;
  containerId: string | null;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DeploymentsListProps {
  projectId: string;
  deployments: Deployment[];
  isPublished: boolean;
}

export function DeploymentsList({ projectId, deployments, isPublished }: DeploymentsListProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const router = useRouter();

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/build`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start deployment');
      }

      toast.success('Deployment started! This may take a few minutes.');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'building':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'deployed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'building':
        return <Badge variant="outline" className="gap-1">Building</Badge>;
      case 'deployed':
        return <Badge variant="outline" className="gap-1 border-green-500 text-green-500">Deployed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="gap-1 border-red-500 text-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Deploy Button */}
      <Card>
        <CardHeader>
          <CardTitle>Deploy Your Project</CardTitle>
          <CardDescription>
            Build and deploy your project to make it live
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDeploy} disabled={isDeploying} size="lg">
            <Rocket className="mr-2 h-4 w-4" />
            {isDeploying ? 'Deploying...' : 'Deploy Now'}
          </Button>
          {isPublished && (
            <p className="text-sm text-muted-foreground mt-4">
              Your project is currently live. Deploying again will update the live version.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
          <CardDescription>
            View all deployments for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deployments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No deployments yet. Click "Deploy Now" to create your first deployment.
            </p>
          ) : (
            <div className="space-y-3">
              {deployments.map((deployment) => (
                <div
                  key={deployment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(deployment.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(deployment.status)}
                        {deployment.url && (
                          <a
                            href={deployment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline font-mono"
                          >
                            {deployment.url}
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span>Deployed {new Date(deployment.createdAt).toLocaleString()}</span>
                        {deployment.containerId && (
                          <span className="ml-4 font-mono">{deployment.containerId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {deployment.url && deployment.status === 'deployed' && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deployment Info */}
      <Card>
        <CardHeader>
          <CardTitle>How Deployments Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>1. Build:</strong> Your pages are converted into a Next.js project with all your custom styles and content.
          </p>
          <p>
            <strong>2. Docker:</strong> The project is packaged into a Docker container for consistent deployment.
          </p>
          <p>
            <strong>3. Deploy:</strong> The container is deployed and accessible via your subdomain or custom domain.
          </p>
          <p className="mt-4 text-xs">
            <strong>Note:</strong> Deployments typically take 2-5 minutes to complete.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  ChevronDown,
  GitBranch,
  MoreHorizontal,
  Activity,
  ArrowUpRight,
  Bell,
  FileText,
  Rocket,
  Globe,
  TrendingUp,
  Filter,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/signin');
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      pages: true,
      deployments: { orderBy: { createdAt: 'desc' } },
    },
  });

  // Calculate statistics
  const totalPages = projects.reduce((acc, p) => acc + p.pages.length, 0);
  const totalDeployments = projects.reduce((acc, p) => acc + p.deployments.length, 0);
  const activeDeployments = projects.reduce((acc, p) => acc + p.deployments.filter(d => d.status === 'active').length, 0);
  const publishedProjects = projects.filter(p => p.isPublished).length;
  
  // Get recent deployments across all projects
  const allDeployments = projects.flatMap(p => 
    p.deployments.map(d => ({ ...d, projectName: p.name, projectId: p.id }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-7rem)]">
      {/* Left Sidebar */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border p-4 lg:p-6 space-y-6">
        {/* Usage Section */}
        <Card className='bg-black'>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Usage</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last 30 days</span>
              <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                <Link href="/dashboard/billing/upgrade">Upgrade</Link>
              </Button>
            </div>
            
            <div className="space-y-3">
              <UsageItem label="Projects" current={projects.length} max={3} />
              <UsageItem label="Bandwidth" current={0} max={100} unit="GB" />
              <UsageItem label="Build Minutes" current={0} max={100} unit="min" />
              <UsageItem label="Deployments" current={projects.reduce((acc, p) => acc + (p.deployments?.length || 0), 0)} max={100} />
            </div>
          </CardContent>
        </Card>

        {/* Alerts Section */}
        <Card className='bg-black'>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">Get alerted for anomalies</p>
              <p className="text-xs text-muted-foreground mb-4">
                Automatically monitor your projects for anomalies and get notified.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/billing/upgrade">Upgrade to Pro</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className='bg-black'>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 3).map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center gap-3 text-sm hover:bg-accent p-2 -mx-2 rounded-md transition-colors"
                  >
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatRelativeTime(project.updatedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GitBranch className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Pages</p>
                  <p className="text-2xl font-bold">{totalPages}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Deployments</p>
                  <p className="text-2xl font-bold">{activeDeployments}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Published</p>
                  <p className="text-2xl font-bold">{publishedProjects}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link href="/dashboard/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">New Project</div>
                    <div className="text-xs text-muted-foreground">Create from scratch</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link href="/dashboard/integrations">
                  <GitBranch className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Import</div>
                    <div className="text-xs text-muted-foreground">From GitHub</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link href="/dashboard/activity">
                  <Activity className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Activity</div>
                    <div className="text-xs text-muted-foreground">View recent</div>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link href="/dashboard/billing">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Upgrade</div>
                    <div className="text-xs text-muted-foreground">View plans</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Deployments Timeline */}
        {allDeployments.length > 0 && (
          <Card className="mb-6 bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Deployments</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/activity">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allDeployments.map((deployment: any) => (
                  <Link
                    key={deployment.id}
                    href={`/dashboard/projects/${deployment.projectId}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/10 transition-colors"
                  >
                    <div className={`h-2 w-2 rounded-full ${
                      deployment.status === 'active' ? 'bg-green-500' :
                      deployment.status === 'building' ? 'bg-yellow-500 animate-pulse' :
                      deployment.status === 'failed' ? 'bg-red-500' : 'bg-muted'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deployment.projectName}</p>
                      <p className="text-xs text-muted-foreground">
                        {deployment.status} • {formatRelativeTime(deployment.createdAt)}
                      </p>
                    </div>
                    {deployment.url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={deployment.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Projects..." 
              className="pl-9 bg-input border-border/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Projects</DropdownMenuItem>
                <DropdownMenuItem>Published</DropdownMenuItem>
                <DropdownMenuItem>Drafts</DropdownMenuItem>
                <DropdownMenuItem>With Deployments</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="hidden sm:flex items-center border border-border/50 rounded-md">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none rounded-l-md">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none rounded-r-md border-l border-border/50">
                <List className="h-4 w-4" />
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="gap-2">
                  Add New...
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/projects/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/integrations">Import from GitHub</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/projects/new">Clone Template</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Projects Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-muted-foreground">Projects</h2>
          <span className="text-sm text-muted-foreground">{projects.length} total</span>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="p-12 bg-black">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Get started by creating your first webstore project or importing from a template.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/dashboard/projects/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/projects">Browse Projects</Link>
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function UsageItem({ 
  label, 
  current, 
  max, 
  unit = '' 
}: { 
  label: string; 
  current: number; 
  max: number; 
  unit?: string;
}) {
  const percentage = Math.min((current / max) * 100, 100);
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-xs">
          {current}{unit} / {max}{unit}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-foreground/20 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const latestDeployment = project.deployments?.[0];
  const domain = project.subdomain 
    ? `${project.subdomain}.vixle.app` 
    : project.customDomain || null;

  return (
    <Card className="group hover:border-foreground/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Link 
            href={`/dashboard/projects/${project.id}`}
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">
                {project.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate group-hover:text-blue-500 transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {domain ? domain : 'No domain configured'}
              </p>
            </div>
          </Link>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/dashboard/projects/${project.id}`}>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/projects/${project.id}`}>View Project</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/projects/${project.id}/settings`}>Settings</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {latestDeployment ? (
              <>
                <span className={`h-2 w-2 rounded-full ${
                  latestDeployment.status === 'active' ? 'bg-green-500' :
                  latestDeployment.status === 'building' ? 'bg-yellow-500 animate-pulse' :
                  latestDeployment.status === 'failed' ? 'bg-red-500' : 'bg-muted'
                }`} />
                <span className="text-muted-foreground capitalize">
                  {latestDeployment.status === 'active' ? 'Live' : latestDeployment.status}
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-muted" />
                <span className="text-muted-foreground">No Deployment</span>
              </>
            )}
          </div>
          <span className="text-muted-foreground">
            {formatRelativeTime(project.updatedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

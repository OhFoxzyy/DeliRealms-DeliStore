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
  Bell
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
      pages: { take: 1 },
      deployments: { take: 1, orderBy: { createdAt: 'desc' } },
    },
  });

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
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Projects..." 
              className="pl-9 bg-muted/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center border rounded-md">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none rounded-l-md">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none rounded-r-md border-l">
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

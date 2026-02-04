import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Activity, Rocket, FileEdit, Plus } from 'lucide-react';

const prisma = new PrismaClient();

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/signin');

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      deployments: { take: 3, orderBy: { createdAt: 'desc' } },
      pages: { take: 5, orderBy: { updatedAt: 'desc' } },
    },
  });

  const activities: { type: string; project: string; projectId: string; time: Date; icon: typeof Rocket }[] = [];
  for (const p of projects) {
    for (const d of p.deployments) {
      activities.push({ type: 'deployment', project: p.name, projectId: p.id, time: d.createdAt, icon: Rocket });
    }
    for (const page of p.pages) {
      activities.push({ type: 'page', project: p.name, projectId: p.id, time: page.updatedAt, icon: FileEdit });
    }
  }
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const recent = activities.slice(0, 20);

  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Activity</h1>
      <p className="text-muted-foreground mb-8">
        Recent activity across your projects
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-4">
              {recent.map((a, i) => (
                <Link
                  key={i}
                  href={`/dashboard/projects/${a.projectId}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <a.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {a.type === 'deployment' ? 'Deployment' : 'Page updated'} in {a.project}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(a.time)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatTime(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString();
}

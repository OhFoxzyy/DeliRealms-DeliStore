import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, ArrowUpRight } from 'lucide-react';

const prisma = new PrismaClient();

export default async function UsagePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/signin');

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: { deployments: true },
  });

  const totalProjects = projects.length;
  const totalDeployments = projects.reduce((acc, p) => acc + p.deployments.length, 0);

  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Usage</h1>
      <p className="text-muted-foreground mb-8">
        Monitor your usage and limits
      </p>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">of 10 limit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeployments}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 GB</div>
            <p className="text-xs text-muted-foreground">of 100 GB</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade for more</CardTitle>
          <CardDescription>
            Get higher limits and more features with a Pro or Elite plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/billing/upgrade">
              View plans
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

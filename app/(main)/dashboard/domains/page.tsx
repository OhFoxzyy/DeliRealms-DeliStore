import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Globe, Plus } from 'lucide-react';

const prisma = new PrismaClient();

export default async function DomainsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/signin');

  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
      OR: [{ subdomain: { not: null } }, { customDomain: { not: null } }],
    },
  });

  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Domains</h1>
      <p className="text-muted-foreground mb-8">
        Manage domains across your projects
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Your Domains
          </CardTitle>
          <CardDescription>
            Subdomains and custom domains for deployed projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No domains configured</p>
              <Button asChild>
                <Link href="/dashboard/projects">
                  <Plus className="mr-2 h-4 w-4" />
                  Create a project
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}/domains`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {p.subdomain && <p>{p.subdomain}.vixle.app</p>}
                      {p.customDomain && <p>{p.customDomain}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Manage</Button>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

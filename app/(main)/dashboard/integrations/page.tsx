import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plug, Github, CreditCard } from 'lucide-react';

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/signin');

  const integrations = [
    { id: 'github', name: 'GitHub', description: 'Import projects from GitHub repositories', icon: Github, href: '#', available: false },
    { id: 'stripe', name: 'Stripe', description: 'Accept payments with Stripe checkout', icon: CreditCard, href: '#', available: true },
  ];

  return (
    <div className="container py-8 px-4">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Integrations</h1>
        <p className="text-muted-foreground mb-8">
          Connect external services to your projects
        </p>

        <div className="space-y-4">
          {integrations.map((int) => (
            <Card key={int.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <int.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{int.name}</CardTitle>
                    <CardDescription>{int.description}</CardDescription>
                  </div>
                </div>
                <Button variant={int.available ? 'default' : 'outline'} disabled={!int.available} asChild={int.available}>
                  <Link href={int.href}>{int.available ? 'Configure' : 'Coming soon'}</Link>
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRICING_PLANS } from '@/lib/pricing-plans';
import Link from 'next/link';
import { Check, Zap, Crown, Building2, Sparkles } from 'lucide-react';

const prisma = new PrismaClient();

const planIcons = {
  free: Zap,
  pro: Sparkles,
  team: Crown,
  enterprise: Building2,
};

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/signin');
  }

  let subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        status: 'free',
        plan: 'free',
      },
    });
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription and billing information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You are currently on the {subscription.plan} plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  {(() => {
                    const Icon = planIcons[subscription.plan as keyof typeof planIcons] || Zap;
                    return <Icon className="h-6 w-6 text-primary" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold capitalize">{subscription.plan} Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {subscription.plan === 'free' 
                      ? 'Upgrade to unlock more features' 
                      : `Status: ${subscription.status}`}
                  </p>
                </div>
              </div>
              {subscription.plan !== 'enterprise' && (
                <Link href="/dashboard/billing/upgrade">
                  <Button>Upgrade Plan</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PRICING_PLANS.map((plan) => {
              const Icon = planIcons[plan.id as keyof typeof planIcons] || Zap;
              const isCurrent = subscription.plan === plan.id;

              return (
                <Card key={plan.id} className={isCurrent ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-8 w-8 text-primary" />
                      {isCurrent && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.interval}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {plan.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-sm text-muted-foreground">
                          +{plan.features.length - 5} more features
                        </li>
                      )}
                    </ul>
                    {!isCurrent && (
                      <Link href={`/dashboard/billing/upgrade?plan=${plan.id}`}>
                        <Button className="w-full" variant={plan.id === 'pro' ? 'default' : 'outline'}>
                          {subscription.plan === 'free' ? 'Upgrade' : 'Switch Plan'}
                        </Button>
                      </Link>
                    )}
                    {isCurrent && (
                      <Button className="w-full" variant="outline" disabled>
                        Current Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {subscription.plan !== 'free' && (
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your past invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                No billing history available yet
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

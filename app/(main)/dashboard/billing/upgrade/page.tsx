"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRICING_PLANS } from '@/lib/pricing-plans';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'pro';
  
  const [loading, setLoading] = useState(false);
  const plan = PRICING_PLANS.find(p => p.id === planId);

  if (!plan) {
    return <div>Plan not found</div>;
  }

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard/billing?upgraded=true');
      } else {
        alert(data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto">
      <Link href="/dashboard/billing">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Billing
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Upgrade to {plan.name}</h1>
          <p className="text-muted-foreground mb-6">{plan.description}</p>

          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Included Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Limits:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Projects:</span>
                      <p className="font-medium">
                        {plan.limits.projects === -1 ? 'Unlimited' : plan.limits.projects}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pages:</span>
                      <p className="font-medium">
                        {plan.limits.pages === -1 ? 'Unlimited' : plan.limits.pages}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Storage:</span>
                      <p className="font-medium">{plan.limits.storage}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bandwidth:</span>
                      <p className="font-medium">{plan.limits.bandwidth}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Team Members:</span>
                      <p className="font-medium">
                        {plan.limits.teamMembers === -1 ? 'Unlimited' : plan.limits.teamMembers}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">API Access:</span>
                      <p className="font-medium">{plan.limits.apiAccess ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>Review your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>{plan.name} Plan</span>
                <span className="font-semibold">${plan.price}/{plan.interval}</span>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Billing cycle</span>
                <span>Monthly</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total due today</span>
                  <span>${plan.price}</span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  By confirming your subscription, you agree to our terms of service and privacy policy. 
                  Your subscription will automatically renew each {plan.interval} unless cancelled.
                </p>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime. No long-term commitments.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

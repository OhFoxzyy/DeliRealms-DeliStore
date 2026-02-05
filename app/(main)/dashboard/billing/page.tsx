"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PRICING_PLANS } from '@/lib/pricing-plans';
import Link from 'next/link';
import { Check, Zap, Crown, Building2, Sparkles, CreditCard, Download, Plus, Trash2, TrendingUp, Server, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const planIcons = {
  free: Zap,
  pro: Sparkles,
  team: Crown,
  enterprise: Building2,
};

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  downloadUrl?: string;
}

interface UsageStats {
  projects: { used: number; limit: number };
  pages: { used: number; limit: number };
  storage: { used: number; limit: number };
  bandwidth: { used: number; limit: number };
  deployments: { used: number; limit: number };
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState({ plan: 'free', status: 'free' });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    projects: { used: 0, limit: 10 },
    pages: { used: 0, limit: 50 },
    storage: { used: 0, limit: 10 },
    bandwidth: { used: 0, limit: 100 },
    deployments: { used: 0, limit: 50 },
  });
  const [loading, setLoading] = useState(true);
  const [addCardDialogOpen, setAddCardDialogOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  useEffect(() => {
    async function fetchBillingData() {
      try {
        const response = await fetch('/api/billing');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription || { plan: 'free', status: 'free' });
          setPaymentMethods(data.paymentMethods || []);
          setInvoices(data.invoices || []);
          setUsageStats(data.usageStats || usageStats);
        }
      } catch (error) {
        console.error('Failed to fetch billing data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBillingData();
  }, []);

  const handleAddPaymentMethod = () => {
    if (!cardNumber || !cardExpiry || !cardCVC) {
      toast.error('Please fill in all card details');
      return;
    }
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      last4: cardNumber.slice(-4),
      brand: 'Visa',
      expiryMonth: parseInt(cardExpiry.split('/')[0]),
      expiryYear: parseInt('20' + cardExpiry.split('/')[1]),
      isDefault: paymentMethods.length === 0,
    };
    setPaymentMethods([...paymentMethods, newMethod]);
    setCardNumber('');
    setCardExpiry('');
    setCardCVC('');
    setAddCardDialogOpen(false);
    toast.success('Payment method added');
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    toast.success('Default payment method updated');
  };

  const handleDeletePaymentMethod = (id: string) => {
    if (paymentMethods.find(m => m.id === id)?.isDefault && paymentMethods.length > 1) {
      toast.error('Cannot delete default payment method');
      return;
    }
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
    toast.success('Payment method removed');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Payment Methods</h2>
              <p className="text-sm text-muted-foreground">Manage your payment methods</p>
            </div>
            <Dialog open={addCardDialogOpen} onOpenChange={setAddCardDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new credit or debit card
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                      maxLength={16}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="card-expiry">Expiry (MM/YY)</Label>
                      <Input
                        id="card-expiry"
                        placeholder="12/25"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-cvc">CVC</Label>
                      <Input
                        id="card-cvc"
                        placeholder="123"
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value)}
                        maxLength={4}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddPaymentMethod} className="w-full">
                    Add Card
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {paymentMethods.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No payment methods on file</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {method.brand} •••• {method.last4}
                            </p>
                            {method.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          {method.expiryMonth && method.expiryYear && (
                            <p className="text-sm text-muted-foreground">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(method.id)}
                          >
                            Set as Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Billing History</h2>
            <p className="text-sm text-muted-foreground">View and download your invoices</p>
          </div>

          {invoices.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No invoices yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-accent transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                            <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'pending' ? 'secondary' : 'destructive'}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(invoice.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{invoice.plan} Plan</span>
                          </div>
                        </div>
                      </div>
                      {invoice.downloadUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={invoice.downloadUrl}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Usage Statistics</h2>
            <p className="text-sm text-muted-foreground">Monitor your resource usage</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: 'Projects', icon: Server, ...usageStats.projects, unit: '' },
              { label: 'Pages', icon: FileText, ...usageStats.pages, unit: '' },
              { label: 'Storage', icon: TrendingUp, used: usageStats.storage.used, limit: usageStats.storage.limit, unit: 'GB' },
              { label: 'Bandwidth', icon: TrendingUp, used: usageStats.bandwidth.used, limit: usageStats.bandwidth.limit, unit: 'GB' },
              { label: 'Deployments', icon: Server, ...usageStats.deployments, unit: '' },
            ].map((stat) => {
              const percentage = getUsagePercentage(stat.used, stat.limit);
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base">{stat.label}</CardTitle>
                      </div>
                      <Badge variant={percentage > 90 ? 'destructive' : percentage > 75 ? 'secondary' : 'outline'}>
                        {stat.used} / {stat.limit} {stat.unit}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Usage</span>
                        <span className="font-medium">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

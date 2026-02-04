export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  stripePriceId?: string;
  features: string[];
  limits: {
    projects: number;
    pages: number;
    storage: string;
    bandwidth: string;
    customDomain: boolean;
    teamMembers: number;
    apiAccess: boolean;
    priority: boolean;
  };
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out the platform',
    price: 0,
    interval: 'month',
    features: [
      '3 projects',
      '10 pages per project',
      '1GB storage',
      '10GB bandwidth',
      'DeliStore subdomain',
      'Basic components',
      'Community support',
    ],
    limits: {
      projects: 3,
      pages: 10,
      storage: '1GB',
      bandwidth: '10GB',
      customDomain: false,
      teamMembers: 1,
      apiAccess: false,
      priority: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious builders and small businesses',
    price: 29,
    interval: 'month',
    stripePriceId: 'price_pro_monthly',
    features: [
      'Unlimited projects',
      'Unlimited pages',
      '50GB storage',
      '500GB bandwidth',
      'Custom domain support',
      'All components',
      'Priority support',
      'Remove DeliStore branding',
      'Advanced analytics',
    ],
    limits: {
      projects: -1,
      pages: -1,
      storage: '50GB',
      bandwidth: '500GB',
      customDomain: true,
      teamMembers: 1,
      apiAccess: true,
      priority: true,
    },
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For teams and growing businesses',
    price: 99,
    interval: 'month',
    stripePriceId: 'price_team_monthly',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Team collaboration',
      'Role-based permissions',
      '200GB storage',
      '2TB bandwidth',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
    limits: {
      projects: -1,
      pages: -1,
      storage: '200GB',
      bandwidth: '2TB',
      customDomain: true,
      teamMembers: 10,
      apiAccess: true,
      priority: true,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: 499,
    interval: 'month',
    stripePriceId: 'price_enterprise_monthly',
    features: [
      'Everything in Team',
      'Unlimited team members',
      'Unlimited storage',
      'Unlimited bandwidth',
      'White-label solution',
      'Custom deployment',
      'SLA guarantee',
      '24/7 phone support',
      'Dedicated account manager',
      'On-premise option',
    ],
    limits: {
      projects: -1,
      pages: -1,
      storage: 'Unlimited',
      bandwidth: 'Unlimited',
      customDomain: true,
      teamMembers: -1,
      apiAccess: true,
      priority: true,
    },
  },
];

export function getPlanById(id: string): PricingPlan | undefined {
  return PRICING_PLANS.find(plan => plan.id === id);
}

export function canCreateProject(plan: string, currentProjects: number): boolean {
  const planDetails = getPlanById(plan);
  if (!planDetails) return false;
  if (planDetails.limits.projects === -1) return true;
  return currentProjects < planDetails.limits.projects;
}

export function canAddPage(plan: string, currentPages: number): boolean {
  const planDetails = getPlanById(plan);
  if (!planDetails) return false;
  if (planDetails.limits.pages === -1) return true;
  return currentPages < planDetails.limits.pages;
}

export function canUseCustomDomain(plan: string): boolean {
  const planDetails = getPlanById(plan);
  return planDetails?.limits.customDomain || false;
}

export function getTeamMemberLimit(plan: string): number {
  const planDetails = getPlanById(plan);
  return planDetails?.limits.teamMembers || 1;
}

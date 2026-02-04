import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { getPlanById } from '@/lib/pricing-plans';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get or create subscription
    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (subscription) {
      // Update existing subscription
      subscription = await prisma.subscription.update({
        where: { userId: session.user.id },
        data: {
          plan: planId,
          status: 'active',
          stripePriceId: plan.stripePriceId || null,
        },
      });
    } else {
      // Create new subscription
      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: planId,
          status: 'active',
          stripePriceId: plan.stripePriceId || null,
        },
      });
    }

    // In a real implementation, you would:
    // 1. Create a Stripe checkout session
    // 2. Redirect user to Stripe
    // 3. Handle webhook for successful payment
    // For now, we'll just update the subscription directly

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

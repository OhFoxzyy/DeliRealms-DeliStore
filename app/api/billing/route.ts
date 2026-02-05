import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: {
        pages: true,
        deployments: true,
      },
    });

    const totalPages = projects.reduce((sum, p) => sum + p.pages.length, 0);
    const totalDeployments = projects.reduce((sum, p) => sum + p.deployments.length, 0);

    // Mock usage stats - in production, calculate from actual usage
    const usageStats = {
      projects: { used: projects.length, limit: 10 },
      pages: { used: totalPages, limit: 50 },
      storage: { used: 2.5, limit: 10 },
      bandwidth: { used: 45, limit: 100 },
      deployments: { used: totalDeployments, limit: 50 },
    };

    return NextResponse.json({
      subscription: subscription || { plan: 'free', status: 'free' },
      paymentMethods: [],
      invoices: [],
      usageStats,
    });
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 });
  }
}


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
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        OR: [{ subdomain: { not: null } }, { customDomain: { not: null } }],
      },
    });

    const domains = projects.flatMap(p => {
      const result = [];
      if (p.subdomain) {
        result.push({
          id: `${p.id}-subdomain`,
          projectId: p.id,
          projectName: p.name,
          domain: `${p.subdomain}.vixle.app`,
          type: 'subdomain',
          sslStatus: 'active' as const,
          verificationStatus: 'verified' as const,
          dnsConfigured: true,
        });
      }
      if (p.customDomain) {
        result.push({
          id: `${p.id}-custom`,
          projectId: p.id,
          projectName: p.name,
          domain: p.customDomain,
          type: 'custom',
          sslStatus: 'pending' as const,
          verificationStatus: 'pending' as const,
          dnsConfigured: false,
          analytics: {
            visitors: Math.floor(Math.random() * 1000),
            pageViews: Math.floor(Math.random() * 5000),
            bandwidth: Math.random() * 10,
          },
        });
      }
      return result;
    });

    return NextResponse.json({ domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}


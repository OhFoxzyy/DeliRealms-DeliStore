import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
      totalUsers,
      totalProjects,
      totalPages,
      totalComponents,
      activeUsers,
      publishedProjects,
      bannedUsers,
      flaggedContent,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.page.count(),
      prisma.component.count(),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.project.count({
        where: { isPublished: true },
      }),
      prisma.user.count({
        where: { isBanned: true },
      }),
      prisma.flaggedContent.count({
        where: { status: 'pending' },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalProjects,
      totalPages,
      totalComponents,
      activeUsers,
      publishedProjects,
      bannedUsers,
      flaggedContent,
    });
  } catch (error) {
    console.error('[v0] Error fetching management stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

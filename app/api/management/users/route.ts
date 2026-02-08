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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        _count: {
          select: {
            components: true,
            loginHistory: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get project counts for each user
    const usersWithProjects = await Promise.all(
      users.map(async (u) => {
        const projectCount = await prisma.project.count({
          where: { userId: u.id },
        });
        return {
          ...u,
          _count: {
            ...u._count,
            projects: projectCount,
          },
        };
      })
    );

    return NextResponse.json(usersWithProjects);
  } catch (error) {
    console.error('[v0] Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

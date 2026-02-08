import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db as prisma } from '@/lib/prisma';

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
        createdAt: true,
        _count: {
          select: {
            components: true,
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
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

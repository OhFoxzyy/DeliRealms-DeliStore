import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
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

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Fetch user details separately for each project
    const projectsWithUsers = await Promise.all(
      projects.map(async (project) => {
        const projectUser = await prisma.user.findUnique({
          where: { id: project.userId },
          select: {
            name: true,
            email: true,
          },
        });
        return {
          ...project,
          user: projectUser,
        };
      })
    );

    return NextResponse.json(projectsWithUsers);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
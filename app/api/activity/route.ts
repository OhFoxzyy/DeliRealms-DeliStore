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
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        deployments: { orderBy: { createdAt: 'desc' } },
        pages: { orderBy: { updatedAt: 'desc' } },
      },
    });

    const activities: Array<{ type: string; project: string; projectId: string; time: Date }> = [];
    
    for (const p of projects) {
      for (const d of p.deployments) {
        activities.push({ 
          type: 'deployment', 
          project: p.name, 
          projectId: p.id, 
          time: d.createdAt 
        });
      }
      for (const page of p.pages) {
        activities.push({ 
          type: 'page', 
          project: p.name, 
          projectId: p.id, 
          time: page.updatedAt 
        });
      }
      activities.push({ 
        type: 'project', 
        project: p.name, 
        projectId: p.id, 
        time: p.updatedAt 
      });
    }
    
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  subdomain: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, subdomain } = projectSchema.parse(body);

    // Check if subdomain is already taken
    if (subdomain) {
      const existing = await prisma.project.findUnique({
        where: { subdomain },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Subdomain is already taken' },
          { status: 400 }
        );
      }
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        subdomain,
        userId: session.user.id,
      },
    });

    // Create a default home page
    await prisma.page.create({
      data: {
        projectId: project.id,
        name: 'Home',
        slug: 'index',
        isHome: true,
        content: JSON.stringify({
          elements: []
        }),
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        pages: true,
        deployments: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

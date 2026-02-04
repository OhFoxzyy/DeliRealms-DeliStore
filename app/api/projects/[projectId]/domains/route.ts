import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const domainSchema = z.object({
  subdomain: z.string().regex(/^[a-z0-9-]+$/).optional(),
  customDomain: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json();
    const { subdomain, customDomain } = domainSchema.parse(body);

    // Check if subdomain is already taken
    if (subdomain && subdomain !== project.subdomain) {
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

    // Check if custom domain is already taken
    if (customDomain && customDomain !== project.customDomain) {
      const existing = await prisma.project.findUnique({
        where: { customDomain },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Custom domain is already in use' },
          { status: 400 }
        );
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id: params.projectId },
      data: {
        ...(subdomain !== undefined && { subdomain }),
        ...(customDomain !== undefined && { customDomain }),
      },
    });

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Domain update error:', error);
    return NextResponse.json(
      { error: 'Failed to update domain' },
      { status: 500 }
    );
  }
}

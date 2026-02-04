import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

const envVarSchema = z.object({
  key: z.string().min(1).regex(/^[A-Z0-9_]+$/, 'Key must contain only uppercase letters, numbers, and underscores'),
  value: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { projectId } = await params;
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json();
    const { key, value } = envVarSchema.parse(body);

    // Check if key already exists
    const existing = await prisma.environmentVariable.findUnique({
      where: {
        projectId_key: {
          projectId,
          key,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Environment variable with this key already exists' },
        { status: 400 }
      );
    }

    const envVar = await prisma.environmentVariable.create({
      data: {
        projectId,
        key,
        value,
      },
    });

    return NextResponse.json({ envVar }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Env var creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create environment variable' },
      { status: 500 }
    );
  }
}

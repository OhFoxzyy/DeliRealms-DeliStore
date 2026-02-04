import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const envVar = await prisma.environmentVariable.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!envVar || envVar.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Environment variable not found' },
        { status: 404 }
      );
    }

    await prisma.environmentVariable.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Environment variable deleted' });
  } catch (error) {
    console.error('Env var deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete environment variable' },
      { status: 500 }
    );
  }
}

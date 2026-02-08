import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { projectId } = await params;

    await prisma.project.delete({
      where: { id: projectId },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'project_deleted',
        resource: 'project',
        resourceId: projectId,
        details: {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

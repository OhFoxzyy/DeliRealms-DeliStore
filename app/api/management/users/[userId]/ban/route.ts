import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId } = await params;
    const { reason } = await request.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: reason,
        bannedAt: new Date(),
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'user_banned',
        resource: 'user',
        resourceId: userId,
        details: { reason },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[v0] Error banning user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

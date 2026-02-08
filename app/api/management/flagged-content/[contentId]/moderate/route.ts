import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
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

    const { contentId } = await params;
    const { action } = await request.json();

    const status = action === 'approve' ? 'approved' : 'rejected';

    const flaggedContent = await prisma.flaggedContent.update({
      where: { id: contentId },
      data: { status },
    });

    // Create moderation action record
    await prisma.moderationAction.create({
      data: {
        flaggedContentId: contentId,
        moderatorId: admin.id,
        action: status,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: action === 'approve' ? 'content_approved' : 'content_rejected',
        resource: 'flagged_content',
        resourceId: contentId,
        details: { status },
      },
    });

    return NextResponse.json(flaggedContent);
  } catch (error) {
    console.error('[v0] Error moderating content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

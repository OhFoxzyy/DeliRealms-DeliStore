import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db as prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { pageId: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comment = await prisma.pageComment.findUnique({
      where: { id: params.commentId },
      include: { page: { include: { project: true } } },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check access
    const hasAccess = comment.page.project.userId === session.user.id ||
      await prisma.pageCollaborator.findFirst({
        where: {
          pageId: params.pageId,
          userId: session.user.id,
        },
      });

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { content } = await request.json();

    const thread = await prisma.pageCommentThread.create({
      data: {
        commentId: params.commentId,
        userId: session.user.id,
        content,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

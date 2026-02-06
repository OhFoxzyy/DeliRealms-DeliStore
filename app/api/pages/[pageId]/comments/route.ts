import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db as prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { id: params.pageId },
      include: { project: true },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Check if user has access
    const hasAccess = page.project.userId === session.user.id ||
      await prisma.pageCollaborator.findFirst({
        where: {
          pageId: params.pageId,
          userId: session.user.id,
        },
      });

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const comments = await prisma.pageComment.findMany({
      where: { pageId: params.pageId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        threads: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { id: params.pageId },
      include: { project: true },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Check if user has access
    const hasAccess = page.project.userId === session.user.id ||
      await prisma.pageCollaborator.findFirst({
        where: {
          pageId: params.pageId,
          userId: session.user.id,
          role: { in: ['editor', 'admin'] },
        },
      });

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { elementId, content } = await request.json();

    const comment = await prisma.pageComment.create({
      data: {
        pageId: params.pageId,
        userId: session.user.id,
        elementId,
        content,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId, resolved } = await request.json();

    const comment = await prisma.pageComment.findUnique({
      where: { id: commentId },
      include: { page: { include: { project: true } } },
    });

    if (!comment || comment.page.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const updated = await prisma.pageComment.update({
      where: { id: commentId },
      data: { resolved: resolved !== undefined ? resolved : !comment.resolved },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

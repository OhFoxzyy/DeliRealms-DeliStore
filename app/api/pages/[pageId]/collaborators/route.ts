import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { db as prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { project: true },
    });

    if (!page || page.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const collaborators = await prisma.pageCollaborator.findMany({
      where: { pageId: pageId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { project: true },
    });

    if (!page || page.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const { userId, role } = await request.json();

    const collaborator = await prisma.pageCollaborator.upsert({
      where: {
        pageId_userId: {
          pageId: pageId,
          userId,
        },
      },
      update: { role },
      create: {
        pageId: pageId,
        userId,
        role: role || 'viewer',
      },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });

    return NextResponse.json(collaborator);
  } catch (error) {
    console.error('Error adding collaborator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { project: true },
    });

    if (!page || page.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    await prisma.pageCollaborator.delete({
      where: {
        pageId_userId: {
          pageId: pageId,
          userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
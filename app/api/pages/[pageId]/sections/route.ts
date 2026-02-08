import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { db as prisma } from '@/lib/prisma';

// GET handler for Sections
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

    const sections = await prisma.pageSection.findMany({
      where: { pageId },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler for Section update
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

    const { elementId, published } = await request.json();

    const section = await prisma.pageSection.upsert({
      where: {
        pageId_elementId: {
          pageId,
          elementId,
        },
      },
      update: { published },
      create: {
        pageId,
        elementId,
        published: published || false,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
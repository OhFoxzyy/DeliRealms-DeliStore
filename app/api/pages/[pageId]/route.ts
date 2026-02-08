import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { generatePageCodeFromElements } from '@/lib/page-builder/codegen';

const prisma = new PrismaClient();

// PATCH handler (update page content)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { pageId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { project: true },
    });

    if (!page || page.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const body = await req.json();
    const content: string | undefined = body.content;

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    let code: string | undefined;
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.elements)) {
        code = generatePageCodeFromElements(parsed.elements);
      }
    } catch {
      // If parsing fails, keep code undefined and only update content
    }

    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        content,
        ...(code ? { code } : {}),
      },
    });

    return NextResponse.json({ page: updatedPage });
  } catch (error) {
    console.error('Page update error:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

// DELETE handler (delete page)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { pageId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { project: true },
    });

    if (!page || page.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    await prisma.page.delete({
      where: { id: pageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Page delete error:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
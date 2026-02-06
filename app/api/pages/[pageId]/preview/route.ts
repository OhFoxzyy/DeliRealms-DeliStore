import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db as prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

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

    if (!page || page.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const { password, expiresAt } = await request.json();

    const token = randomBytes(32).toString('hex');

    const previewLink = await prisma.pagePreviewLink.create({
      data: {
        pageId: params.pageId,
        token,
        password: password ? await import('bcryptjs').then(m => m.default.hash(password, 10)) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    const previewUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/preview/${token}`;

    return NextResponse.json({ ...previewLink, url: previewUrl });
  } catch (error) {
    console.error('Error creating preview link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    if (!page || page.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const links = await prisma.pagePreviewLink.findMany({
      where: { pageId: params.pageId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching preview links:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

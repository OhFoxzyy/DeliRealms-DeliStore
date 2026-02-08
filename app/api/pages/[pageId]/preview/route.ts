import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { db as prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

// DELETE handler (linkId from body)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const { linkId } = await request.json();

  if (!linkId) {
    return NextResponse.json({ error: 'Missing linkId' }, { status: 400 });
  }

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

  await prisma.pagePreviewLink.delete({ where: { id: linkId } });
  return NextResponse.json({ success: true });
}

// POST handler (create preview link)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
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

  const { password, expiresAt } = await request.json();
  const token = randomBytes(32).toString('hex');
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  const previewLink = await prisma.pagePreviewLink.create({
    data: {
      pageId,
      token,
      password: hashedPassword,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  const previewUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/preview/${token}`;

  return NextResponse.json({ ...previewLink, url: previewUrl });
}

// GET handler (fetch preview links)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
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

  const links = await prisma.pagePreviewLink.findMany({
    where: { pageId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(links);
}
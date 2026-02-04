import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { id: params.pageId },
      include: { project: true },
    });

    if (!page || page.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const { content } = await req.json();

    const updatedPage = await prisma.page.update({
      where: { id: params.pageId },
      data: { content },
    });

    return NextResponse.json({ page: updatedPage });
  } catch (error) {
    console.error('Page update error:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

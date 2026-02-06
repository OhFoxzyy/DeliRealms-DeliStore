import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db as prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { pageId: string; linkId: string } }
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

    await prisma.pagePreviewLink.delete({
      where: { id: params.linkId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting preview link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

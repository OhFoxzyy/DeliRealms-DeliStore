import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db as prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const component = await prisma.component.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          { isBuiltin: true },
        ],
      },
    });

    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }

    const versions = await prisma.componentVersion.findMany({
      where: { componentId: params.id },
      orderBy: { version: 'desc' },
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching component versions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const component = await prisma.component.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }

    const { comment } = await request.json();

    const latestVersion = await prisma.componentVersion.findFirst({
      where: { componentId: params.id },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    const version = await prisma.componentVersion.create({
      data: {
        componentId: params.id,
        version: nextVersion,
        content: component.defaultContent,
        style: component.defaultStyle,
        code: component.componentCode,
        comment,
      },
    });

    return NextResponse.json(version);
  } catch (error) {
    console.error('Error creating component version:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

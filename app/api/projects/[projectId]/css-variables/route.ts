import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db as prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const variables = (project.cssVariables as any) || [];
    return NextResponse.json(variables);
  } catch (error) {
    console.error('Error fetching CSS variables:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const variables = await request.json();

    const project = await prisma.project.update({
      where: { id: params.projectId, userId: session.user.id },
      data: { cssVariables: variables },
    });

    return NextResponse.json(project.cssVariables);
  } catch (error) {
    console.error('Error saving CSS variables:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

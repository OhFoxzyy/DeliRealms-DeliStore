import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { db } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const component = await db.component.findUnique({
      where: { id },
    });

    if (!component) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Only owner can view non-builtin templates
    if (!component.isBuiltin) {
      if (!session?.user?.id || component.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({
      id: component.id,
      name: component.name,
      type: component.type,
      category: component.category,
      icon: component.icon,
      defaultContent: component.defaultContent,
      defaultStyle: component.defaultStyle,
      isBuiltin: component.isBuiltin,
      scope: component.isBuiltin ? 'builtin' : 'user',
    });
  } catch (error) {
    console.error('[components/:id] GET error', error);
    return NextResponse.json(
      { error: 'Failed to load component' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await db.component.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing.isBuiltin || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const updated = await db.component.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        type: body.type ?? existing.type,
        category: body.category ?? existing.category,
        icon: body.icon ?? existing.icon,
        defaultContent: body.defaultContent ?? existing.defaultContent,
        defaultStyle: body.defaultStyle ?? existing.defaultStyle,
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      type: updated.type,
      category: updated.category,
      icon: updated.icon,
      defaultContent: updated.defaultContent,
      defaultStyle: updated.defaultStyle,
      isBuiltin: updated.isBuiltin,
      scope: updated.projectId ? 'project' : 'user',
    });
  } catch (error) {
    console.error('[components/:id] PATCH error', error);
    return NextResponse.json(
      { error: 'Failed to update component' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await db.component.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing.isBuiltin || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.component.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[components/:id] DELETE error', error);
    return NextResponse.json(
      { error: 'Failed to delete component' },
      { status: 500 },
    );
  }
}


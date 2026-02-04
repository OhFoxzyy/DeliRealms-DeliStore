import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { db } from '@/lib/prisma';
import { ensureBuiltinComponentsSeeded } from '@/lib/page-builder/component-seeding';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || undefined;
    const builtinParam = url.searchParams.get('builtin');

    // Ensure built‑ins are present so the library is never empty.
    await ensureBuiltinComponentsSeeded();

    const and: any[] = [];

    // Optional filter to only built-in or only user templates
    if (builtinParam === 'true') {
      and.push({ isBuiltin: true });
    } else if (builtinParam === 'false') {
      and.push({ isBuiltin: false });
    }

    // Text search
    if (search) {
      and.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { type: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Visibility: built-ins are shared, templates are per-user
    if (session?.user?.id) {
      and.push({
        OR: [{ isBuiltin: true }, { userId: session.user.id }],
      });
    } else {
      and.push({ isBuiltin: true });
    }

    const where = and.length ? { AND: and } : undefined;

    const components = await db.component.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(
      components.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        category: c.category,
        icon: c.icon,
        defaultContent: c.defaultContent,
        defaultStyle: c.defaultStyle,
        isBuiltin: c.isBuiltin,
        scope: c.isBuiltin ? 'builtin' : c.projectId ? 'project' : 'user',
      })),
    );
  } catch (error) {
    console.error('[components] GET error', error);
    return NextResponse.json(
      { error: 'Failed to load components' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      type,
      category,
      icon,
      defaultContent,
      defaultStyle,
    } = body ?? {};

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 },
      );
    }

    const component = await db.component.create({
      data: {
        name,
        type,
        category,
        icon,
        defaultContent,
        defaultStyle,
        isBuiltin: false,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        id: component.id,
        name: component.name,
        type: component.type,
        category: component.category,
        icon: component.icon,
        defaultContent: component.defaultContent,
        defaultStyle: component.defaultStyle,
        isBuiltin: component.isBuiltin,
        scope: component.projectId ? 'project' : 'user',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[components] POST error', error);
    return NextResponse.json(
      { error: 'Failed to create component' },
      { status: 500 },
    );
  }
}


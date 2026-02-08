import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient, PermissionAction, PermissionResource } from '@/generated/prisma';
import { getUserPermissions, grantPermission, revokePermission } from '@/lib/auth/permissions';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await params;
    const permissions = await getUserPermissions(userId);

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('[v0] Error fetching permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await params;
    const { resource, action, grant } = await request.json();

    if (!resource || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (grant) {
      await grantPermission(userId, resource as PermissionResource, action as PermissionAction, admin.id);
    } else {
      await revokePermission(userId, resource as PermissionResource, action as PermissionAction, admin.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error updating permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient, Role } from '@/generated/prisma';
import { getRolePermissions } from '@/lib/auth/permissions';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    const roles: Role[] = ['hobby', 'pro', 'elite', 'admin'];
    const rolesWithPermissions = roles.map((role) => ({
      role,
      permissions: getRolePermissions(role),
      userCount: 0, // Will be filled below
    }));

    // Get user counts for each role
    for (const roleData of rolesWithPermissions) {
      const count = await prisma.user.count({
        where: { role: roleData.role },
      });
      roleData.userCount = count;
    }

    return NextResponse.json(rolesWithPermissions);
  } catch (error) {
    console.error('[v0] Error fetching roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

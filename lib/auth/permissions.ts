import { PrismaClient, Role, PermissionAction, PermissionResource } from '@/generated/prisma';

const prisma = new PrismaClient();

/**
 * Default permissions for each role
 */
const DEFAULT_ROLE_PERMISSIONS: Record<Role, Array<{ resource: PermissionResource; action: PermissionAction }>> = {
  hobby: [
    { resource: 'project', action: 'create' },
    { resource: 'project', action: 'read' },
    { resource: 'project', action: 'update' },
    { resource: 'project', action: 'delete' },
    { resource: 'page', action: 'create' },
    { resource: 'page', action: 'read' },
    { resource: 'page', action: 'update' },
    { resource: 'page', action: 'delete' },
    { resource: 'component', action: 'create' },
    { resource: 'component', action: 'read' },
  ],
  pro: [
    { resource: 'project', action: 'create' },
    { resource: 'project', action: 'read' },
    { resource: 'project', action: 'update' },
    { resource: 'project', action: 'delete' },
    { resource: 'page', action: 'create' },
    { resource: 'page', action: 'read' },
    { resource: 'page', action: 'update' },
    { resource: 'page', action: 'delete' },
    { resource: 'component', action: 'create' },
    { resource: 'component', action: 'read' },
    { resource: 'component', action: 'update' },
    { resource: 'component', action: 'delete' },
    { resource: 'deployment', action: 'create' },
    { resource: 'deployment', action: 'read' },
    { resource: 'analytics', action: 'read' },
  ],
  elite: [
    { resource: 'project', action: 'create' },
    { resource: 'project', action: 'read' },
    { resource: 'project', action: 'update' },
    { resource: 'project', action: 'delete' },
    { resource: 'page', action: 'create' },
    { resource: 'page', action: 'read' },
    { resource: 'page', action: 'update' },
    { resource: 'page', action: 'delete' },
    { resource: 'component', action: 'create' },
    { resource: 'component', action: 'read' },
    { resource: 'component', action: 'update' },
    { resource: 'component', action: 'delete' },
    { resource: 'deployment', action: 'create' },
    { resource: 'deployment', action: 'read' },
    { resource: 'deployment', action: 'update' },
    { resource: 'deployment', action: 'delete' },
    { resource: 'analytics', action: 'read' },
    { resource: 'settings', action: 'read' },
    { resource: 'settings', action: 'update' },
  ],
  admin: [
    { resource: 'project', action: 'manage' },
    { resource: 'page', action: 'manage' },
    { resource: 'component', action: 'manage' },
    { resource: 'user', action: 'manage' },
    { resource: 'blog', action: 'manage' },
    { resource: 'doc', action: 'manage' },
    { resource: 'roadmap', action: 'manage' },
    { resource: 'deployment', action: 'manage' },
    { resource: 'settings', action: 'manage' },
    { resource: 'analytics', action: 'manage' },
  ],
  banned: []
};

/**
 * Check if a user has permission to perform an action on a resource
 */
export async function hasPermission(
  userId: string,
  resource: PermissionResource,
  action: PermissionAction
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userPermissions: {
          where: {
            resource,
            action,
          },
        },
      },
    });

    if (!user) return false;

    // Check if user is banned
    if (user.isBanned) return false;

    // Check for explicit user permission (overrides role)
    const userPermission = user.userPermissions.find(
      (p) => p.resource === resource && p.action === action
    );
    if (userPermission) {
      return userPermission.allowed;
    }

    // Check role permissions
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[user.role];
    if (!rolePermissions) return false;

    // Admin "manage" permission grants all actions
    if (user.role === 'admin') {
      const hasManage = rolePermissions.some(
        (p) => p.resource === resource && p.action === 'manage'
      );
      if (hasManage) return true;
    }

    // Check if role has specific permission
    return rolePermissions.some(
      (p) => p.resource === resource && p.action === action
    );
  } catch (error) {
    console.error('[v0] Error checking permission:', error);
    return false;
  }
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<
  Array<{ resource: PermissionResource; action: PermissionAction; source: 'role' | 'user' }>
> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userPermissions: true,
      },
    });

    if (!user) return [];

    const permissions: Array<{ resource: PermissionResource; action: PermissionAction; source: 'role' | 'user' }> = [];

    // Add role permissions
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[user.role];
    if (rolePermissions) {
      rolePermissions.forEach((p) => {
        permissions.push({
          resource: p.resource,
          action: p.action,
          source: 'role',
        });
      });
    }

    // Add user-specific permissions
    user.userPermissions.forEach((p) => {
      if (p.allowed) {
        permissions.push({
          resource: p.resource,
          action: p.action,
          source: 'user',
        });
      }
    });

    return permissions;
  } catch (error) {
    console.error('[v0] Error getting user permissions:', error);
    return [];
  }
}

/**
 * Grant a specific permission to a user
 */
export async function grantPermission(
  userId: string,
  resource: PermissionResource,
  action: PermissionAction,
  adminId: string
): Promise<boolean> {
  try {
    await prisma.userPermission.upsert({
      where: {
        userId_resource_action: {
          userId,
          resource,
          action,
        },
      },
      update: {
        allowed: true,
      },
      create: {
        userId,
        resource,
        action,
        allowed: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'permission_granted',
        resource: 'user',
        resourceId: userId,
        details: { resource, action },
      },
    });

    return true;
  } catch (error) {
    console.error('[v0] Error granting permission:', error);
    return false;
  }
}

/**
 * Revoke a specific permission from a user
 */
export async function revokePermission(
  userId: string,
  resource: PermissionResource,
  action: PermissionAction,
  adminId: string
): Promise<boolean> {
  try {
    await prisma.userPermission.upsert({
      where: {
        userId_resource_action: {
          userId,
          resource,
          action,
        },
      },
      update: {
        allowed: false,
      },
      create: {
        userId,
        resource,
        action,
        allowed: false,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'permission_revoked',
        resource: 'user',
        resourceId: userId,
        details: { resource, action },
      },
    });

    return true;
  } catch (error) {
    console.error('[v0] Error revoking permission:', error);
    return false;
  }
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Array<{ resource: PermissionResource; action: PermissionAction }> {
  return DEFAULT_ROLE_PERMISSIONS[role] || [];
}

/**
 * Require permission middleware
 */
export async function requirePermission(
  userId: string,
  resource: PermissionResource,
  action: PermissionAction
): Promise<void> {
  const allowed = await hasPermission(userId, resource, action);
  if (!allowed) {
    throw new Error(`Permission denied: ${action} on ${resource}`);
  }
}

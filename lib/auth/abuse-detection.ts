import { PrismaClient } from '@/generated/prisma';
import { calculateIpSimilarity } from './ip-utils';

const prisma = new PrismaClient();

interface AbuseCheckResult {
  isAbusive: boolean;
  reason?: string;
  confidence: number;
  relatedAccounts?: string[];
}

/**
 * Check for potential multi-accounting abuse
 * Looks for same IP, rapid account creation, etc.
 */
export async function checkForAbuse(
  email: string,
  ipAddress: string,
  userAgent: string
): Promise<AbuseCheckResult> {
  try {
    // Check 1: Recent logins from same IP
    const recentLoginsFromIp = await prisma.loginHistory.count({
      where: {
        ipAddress,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
        success: true,
      },
    });

    if (recentLoginsFromIp > 10) {
      return {
        isAbusive: true,
        reason: 'Excessive login attempts from same IP',
        confidence: 85,
      };
    }

    // Check 2: Recent account creations from same IP
    const recentAccountsFromIp = await prisma.user.count({
      where: {
        lastLoginIp: ipAddress,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    if (recentAccountsFromIp > 5) {
      return {
        isAbusive: true,
        reason: 'Multiple accounts created from same IP recently',
        confidence: 90,
      };
    }

    // Check 3: Find users with similar IPs
    const allUsers = await prisma.user.findMany({
      where: {
        lastLoginIp: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        lastLoginIp: true,
        createdAt: true,
      },
    });

    const suspiciousAccounts: string[] = [];
    for (const user of allUsers) {
      if (!user.lastLoginIp || !user.email) continue; // Add !user.email check
      
      const similarity = calculateIpSimilarity(ipAddress, user.lastLoginIp);
      
      // Same /24 subnet or exact IP match
      if (similarity >= 75 && user.email !== email) {
        suspiciousAccounts.push(user.email);
      }
    }

    if (suspiciousAccounts.length > 3) {
      return {
        isAbusive: true,
        reason: 'Multiple accounts detected from similar IP range',
        confidence: 70,
        relatedAccounts: suspiciousAccounts,
      };
    }

    // Check 4: Email pattern abuse (e.g., user+1@gmail.com, user+2@gmail.com)
    const emailBase = email.split('+')[0].split('@');
    if (emailBase.length === 2) {
      const [localPart, domain] = emailBase;
      const similarEmails = await prisma.user.count({
        where: {
          email: {
            startsWith: `${localPart}+`,
            endsWith: `@${domain}`,
          },
        },
      });

      if (similarEmails > 3) {
        return {
          isAbusive: true,
          reason: 'Email alias abuse detected',
          confidence: 95,
        };
      }
    }

    // Check 5: Failed login attempts from this IP
    const recentFailedLogins = await prisma.loginHistory.count({
      where: {
        ipAddress,
        success: false,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    if (recentFailedLogins > 20) {
      return {
        isAbusive: true,
        reason: 'Excessive failed login attempts detected',
        confidence: 95,
      };
    }

    // No abuse detected
    return {
      isAbusive: false,
      confidence: 0,
    };
  } catch (error) {
    console.error('[v0] Abuse detection error:', error);
    // Don't block on errors, return safe result
    return {
      isAbusive: false,
      confidence: 0,
    };
  }
}

/**
 * Log a login attempt for tracking
 */
export async function logLoginAttempt(
  userId: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  failReason?: string
): Promise<void> {
  try {
    await prisma.loginHistory.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        success,
        failReason,
      },
    });
  } catch (error) {
    console.error('[v0] Failed to log login attempt:', error);
  }
}

/**
 * Check if user account is banned
 */
export async function checkIfBanned(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true },
  });

  return user?.isBanned || false;
}
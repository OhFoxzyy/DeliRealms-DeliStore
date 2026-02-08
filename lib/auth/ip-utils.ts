import { NextRequest } from 'next/server';

/**
 * Extract real IP address from request headers
 * Handles various proxy headers correctly
 */
export function getClientIp(request: NextRequest): string {
  // Check various headers in order of preference
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the first IP in the chain
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback to socket address (rarely available in serverless)
  return 'unknown';
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Check if IP address looks suspicious
 * This is a basic implementation - enhance with proper IP reputation services
 */
export function isSuspiciousIp(ip: string): boolean {
  if (ip === 'unknown') return true;
  
  // Check for localhost/private ranges (shouldn't happen in production)
  if (
    ip.startsWith('127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.')
  ) {
    return true;
  }

  return false;
}

/**
 * Calculate similarity score between two IPs (for detecting same network)
 * Returns score from 0-100 (100 = same IP, 75+ = same /24 subnet)
 */
export function calculateIpSimilarity(ip1: string, ip2: string): number {
  if (ip1 === ip2) return 100;
  
  const parts1 = ip1.split('.');
  const parts2 = ip2.split('.');
  
  if (parts1.length !== 4 || parts2.length !== 4) return 0;
  
  let matchingOctets = 0;
  for (let i = 0; i < 4; i++) {
    if (parts1[i] === parts2[i]) {
      matchingOctets++;
    } else {
      break;
    }
  }
  
  // Same /24 subnet (first 3 octets)
  if (matchingOctets >= 3) return 75;
  // Same /16 subnet (first 2 octets)
  if (matchingOctets >= 2) return 50;
  // Same /8 subnet (first octet)
  if (matchingOctets >= 1) return 25;
  
  return 0;
}

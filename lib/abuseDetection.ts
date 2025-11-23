/**
 * Abuse detection and prevention for TankFindr
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AbuseCheck {
  isAbusive: boolean;
  reason?: string;
  blockDuration?: number; // in minutes
}

/**
 * Check if IP or user is engaging in abusive behavior
 */
export async function checkForAbuse(
  identifier: string,
  type: 'ip' | 'user'
): Promise<AbuseCheck> {
  try {
    // Check recent lookup patterns
    const recentLookups = await getRecentLookups(identifier, type);

    // Pattern 1: Too many lookups in short time (scraping)
    const last5Minutes = recentLookups.filter(
      (l) => Date.now() - new Date(l.created_at).getTime() < 5 * 60 * 1000
    );

    if (last5Minutes.length > 50) {
      return {
        isAbusive: true,
        reason: 'Excessive requests detected (possible scraping)',
        blockDuration: 60, // 1 hour
      };
    }

    // Pattern 2: Identical lookups (testing/probing)
    const uniqueAddresses = new Set(recentLookups.map((l) => l.address));
    if (recentLookups.length > 20 && uniqueAddresses.size < 5) {
      return {
        isAbusive: true,
        reason: 'Repeated identical lookups detected',
        blockDuration: 30, // 30 minutes
      };
    }

    // Pattern 3: Sequential address patterns (automated scraping)
    const addresses = recentLookups.map((l) => l.address);
    if (detectSequentialPattern(addresses)) {
      return {
        isAbusive: true,
        reason: 'Sequential address pattern detected (bot behavior)',
        blockDuration: 120, // 2 hours
      };
    }

    return { isAbusive: false };
  } catch (error) {
    console.error('Error checking for abuse:', error);
    // Fail open - don't block on error
    return { isAbusive: false };
  }
}

/**
 * Get recent lookups for identifier
 */
async function getRecentLookups(
  identifier: string,
  type: 'ip' | 'user'
): Promise<any[]> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const query = supabase
    .from('septic_lookups')
    .select('*')
    .gte('created_at', oneHourAgo)
    .order('created_at', { ascending: false })
    .limit(100);

  if (type === 'ip') {
    query.eq('ip_address', identifier);
  } else {
    query.eq('user_id', identifier);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching lookups:', error);
    return [];
  }

  return data || [];
}

/**
 * Detect if addresses follow a sequential pattern
 */
function detectSequentialPattern(addresses: string[]): boolean {
  if (addresses.length < 10) return false;

  // Extract street numbers
  const numbers = addresses
    .map((addr) => {
      const match = addr.match(/^(\d+)/);
      return match ? parseInt(match[1]) : null;
    })
    .filter((n) => n !== null) as number[];

  if (numbers.length < 10) return false;

  // Check if numbers are sequential (within 5 of each other)
  let sequentialCount = 0;
  for (let i = 1; i < numbers.length; i++) {
    if (Math.abs(numbers[i] - numbers[i - 1]) <= 5) {
      sequentialCount++;
    }
  }

  // If more than 70% are sequential, flag as suspicious
  return sequentialCount / numbers.length > 0.7;
}

/**
 * Log abusive behavior
 */
export async function logAbusiveBehavior(
  identifier: string,
  type: 'ip' | 'user',
  reason: string
): Promise<void> {
  try {
    // TODO: Create abuse_logs table and log to it
    console.warn(`Abusive behavior detected: ${type}=${identifier}, reason=${reason}`);
  } catch (error) {
    console.error('Error logging abuse:', error);
  }
}

/**
 * Check if identifier is currently blocked
 */
export async function isBlocked(
  identifier: string,
  type: 'ip' | 'user'
): Promise<boolean> {
  // TODO: Check blocked_identifiers table
  // For now, return false
  return false;
}

/**
 * Block identifier for specified duration
 */
export async function blockIdentifier(
  identifier: string,
  type: 'ip' | 'user',
  durationMinutes: number,
  reason: string
): Promise<void> {
  try {
    // TODO: Insert into blocked_identifiers table
    console.warn(
      `Blocking ${type}=${identifier} for ${durationMinutes} minutes. Reason: ${reason}`
    );
  } catch (error) {
    console.error('Error blocking identifier:', error);
  }
}

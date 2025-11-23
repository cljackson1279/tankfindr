import { NextRequest } from 'next/server';

interface RateLimitConfig {
  interval: number; // in milliseconds
  uniqueTokenPerInterval: number; // max requests per interval
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
  }
): Promise<{ success: boolean; remaining: number; reset: number }> {
  // Get identifier (IP address or user ID from headers)
  const identifier = getIdentifier(request);

  const now = Date.now();
  const resetTime = now + config.interval;

  // Get or create rate limit entry
  let entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime,
    };
    rateLimitStore.set(identifier, entry);
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  const success = entry.count <= config.uniqueTokenPerInterval;
  const remaining = Math.max(0, config.uniqueTokenPerInterval - entry.count);

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to cleanup
    cleanupOldEntries();
  }

  return {
    success,
    remaining,
    reset: entry.resetTime,
  };
}

function getIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    return `user:${authHeader}`;
  }

  // Fall back to IP address
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : request.ip || 'unknown';
  return `ip:${ip}`;
}

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limit decorator for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  config?: RateLimitConfig
) {
  return async (request: NextRequest) => {
    const { success, remaining, reset } = await rateLimit(request, config);

    if (!success) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          },
        }
      );
    }

    const response = await handler(request);

    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());

    return response;
  };
}

import { redis } from '../redis';
import { EnhancedMonitoringService } from '../monitoring/service';
import type { SecurityEvent } from '../monitoring/types';

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

export async function rateLimit(
  ipAddress: string,
  endpoint: string,
  method: string
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const key = `rate-limit:${ipAddress}:${endpoint}:${method}`;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  try {
    // Get current count and window start
    const [count, windowStartStr] = await redis
      .multi()
      .get(key)
      .get(`${key}:window-start`)
      .exec();

    const currentCount = count ? parseInt(count as string, 10) : 0;
    const currentWindowStart = windowStartStr ? parseInt(windowStartStr as string, 10) : now;

    // If window has expired, reset the counter
    if (currentWindowStart < windowStart) {
      await redis
        .multi()
        .set(key, '1')
        .set(`${key}:window-start`, now.toString())
        .expire(key, Math.ceil(WINDOW_MS / 1000))
        .expire(`${key}:window-start`, Math.ceil(WINDOW_MS / 1000))
        .exec();

      return {
        allowed: true,
        remaining: MAX_REQUESTS - 1,
        reset: now + WINDOW_MS,
      };
    }

    // If under the limit, increment the counter
    if (currentCount < MAX_REQUESTS) {
      await redis.incr(key);
      return {
        allowed: true,
        remaining: MAX_REQUESTS - currentCount - 1,
        reset: currentWindowStart + WINDOW_MS,
      };
    }

    // Rate limit exceeded
    const monitoringService = EnhancedMonitoringService.getInstance();
    await monitoringService.trackSecurityEvent({
      type: 'rate_limit',
      timestamp: new Date(),
      ipAddress,
      endpoint,
      method,
      details: {
        currentCount,
        maxRequests: MAX_REQUESTS,
        windowMs: WINDOW_MS,
      },
      severity: 'high',
    });

    return {
      allowed: false,
      remaining: 0,
      reset: currentWindowStart + WINDOW_MS,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open in case of Redis errors
    return {
      allowed: true,
      remaining: MAX_REQUESTS,
      reset: now + WINDOW_MS,
    };
  }
}

export async function getRateLimitStatus(
  ipAddress: string,
  endpoint: string,
  method: string
): Promise<{ current: number; limit: number; reset: number }> {
  const key = `rate-limit:${ipAddress}:${endpoint}:${method}`;
  const windowStartKey = `${key}:window-start`;

  try {
    const [count, windowStartStr] = await redis
      .multi()
      .get(key)
      .get(windowStartKey)
      .exec();

    const currentCount = count ? parseInt(count as string, 10) : 0;
    const windowStart = windowStartStr ? parseInt(windowStartStr as string, 10) : Date.now();

    return {
      current: currentCount,
      limit: MAX_REQUESTS,
      reset: windowStart + WINDOW_MS,
    };
  } catch (error) {
    console.error('Failed to get rate limit status:', error);
    return {
      current: 0,
      limit: MAX_REQUESTS,
      reset: Date.now() + WINDOW_MS,
    };
  }
}

export async function resetRateLimit(
  ipAddress: string,
  endpoint: string,
  method: string
): Promise<void> {
  const key = `rate-limit:${ipAddress}:${endpoint}:${method}`;
  const windowStartKey = `${key}:window-start`;

  try {
    await redis
      .multi()
      .del(key)
      .del(windowStartKey)
      .exec();
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
  }
} 
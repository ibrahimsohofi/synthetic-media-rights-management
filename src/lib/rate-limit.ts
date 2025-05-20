import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// For development, allow the app to run without Redis
const isDevelopment = process.env.NODE_ENV === 'development';

// Only initialize Redis in production
let redis: Redis | null = null;
if (!isDevelopment) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Redis credentials not found. Rate limiting will be disabled.');
  } else {
    try {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
    }
  }
}

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export async function rateLimitMiddleware(request: NextRequest) {
  // Skip rate limiting in development or if Redis is not available
  if (isDevelopment || !redis) {
    return NextResponse.next();
  }

  // Get IP from headers or fallback to a default
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
  const key = `ratelimit:${ip}`;

  try {
    const current = await redis.get<number>(key) ?? 0;

    if (current >= MAX_REQUESTS) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    await redis.incr(key);
    if (current === 0) {
      await redis.pexpire(key, WINDOW_SIZE);
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', (MAX_REQUESTS - current - 1).toString());
    return response;
  } catch (error) {
    console.error('Rate limit error:', error);
    return NextResponse.next();
  }
} 
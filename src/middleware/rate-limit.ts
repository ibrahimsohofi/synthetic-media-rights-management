import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitConfig {
  tokensPerInterval: number;  // Number of tokens added per interval
  interval: number;          // Interval in milliseconds
  maxTokens: number;         // Maximum number of tokens that can be accumulated
}

const DEFAULT_CONFIG: RateLimitConfig = {
  tokensPerInterval: 60,    // 60 requests
  interval: 60 * 1000,      // per minute
  maxTokens: 60,            // maximum burst size
};

// In-memory store for development
const memoryStore = new Map<string, { tokens: number; lastRefill: number }>();

export async function rateLimit(
  request: NextRequest,
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): Promise<{ success: boolean; remaining: number; reset: Date }> {
  const { tokensPerInterval, interval, maxTokens } = { ...DEFAULT_CONFIG, ...config };

  try {
    const now = Date.now();
    let bucket = memoryStore.get(identifier) || { tokens: maxTokens, lastRefill: now };

    // Calculate tokens to add based on time elapsed
    const timeElapsed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor((timeElapsed * tokensPerInterval) / interval);
    
    // Update tokens
    let newTokens = Math.min(bucket.tokens + tokensToAdd, maxTokens);
    
    // Attempt to consume a token
    const canProceed = newTokens >= 1;
    if (canProceed) {
      newTokens -= 1;
    }

    // Update bucket in memory
    memoryStore.set(identifier, {
      tokens: newTokens,
      lastRefill: now,
    });

    // Calculate reset time
    const tokensNeeded = canProceed ? 1 : 2;
    const timeToNextToken = Math.ceil((interval * tokensNeeded) / tokensPerInterval);
    const reset = new Date(now + timeToNextToken);

    return {
      success: canProceed,
      remaining: newTokens,
      reset,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return {
      success: true,
      remaining: 1,
      reset: new Date(Date.now() + interval),
    };
  }
}

export async function rateLimitMiddleware(
  request: NextRequest,
  config?: Partial<RateLimitConfig>
) {
  // Skip rate limiting for non-API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Generate identifier based on IP and route
  const ip = request.ip || 'anonymous';
  const identifier = `${ip}:${request.nextUrl.pathname}`;

  const result = await rateLimit(request, identifier, config);

  if (!result.success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        reset: result.reset.toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toISOString(),
        },
      }
    );
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toISOString());

  return response;
} 
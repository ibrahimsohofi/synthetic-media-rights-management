import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimitMiddleware } from "./lib/rate-limit";
import { monitoring } from "./lib/monitoring";

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/api/auth",
];

// Paths that don't require rate limiting
const noRateLimitPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
];

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;

  // Get user ID from session if available
  try {
    const token = await getToken({ req: request });
    userId = token?.sub;
  } catch (error) {
    console.error('Error getting token:', error);
  }

  const path = request.nextUrl.pathname;

  // Check if path is public
  const isPublicPath = publicPaths.some(p => path.startsWith(p));
  const isNoRateLimitPath = noRateLimitPaths.some(p => path.startsWith(p));

  // Skip auth and rate-limiting in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Apply rate limiting for non-public paths
  if (!isNoRateLimitPath) {
    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse.status === 429) {
      // Record rate limit error
      try {
        await monitoring.recordError({
          endpoint: path,
          method: request.method,
          errorCode: '429',
          errorMessage: 'Rate limit exceeded',
          timestamp: new Date(),
          userId,
        });
      } catch (error) {
        console.error('Failed to record rate limit error:', error);
      }
      return rateLimitResponse;
    }
  }

  // Check authentication for protected routes
  if (!isPublicPath && !userId) {
    // Record unauthorized access
    try {
      await monitoring.recordError({
        endpoint: path,
        method: request.method,
        errorCode: '401',
        errorMessage: 'Unauthorized access',
        timestamp: new Date(),
        userId,
      });
    } catch (error) {
      console.error('Failed to record unauthorized access:', error);
    }

    // Redirect to login page
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  // Process the request
  const response = await NextResponse.next();

  // Record metrics
  const duration = Date.now() - startTime;
  try {
    await monitoring.recordAPIMetrics({
      endpoint: path,
      method: request.method,
      statusCode: response.status,
      duration,
      timestamp: new Date(),
      userId,
    });
  } catch (error) {
    console.error('Failed to record API metrics:', error);
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-Response-Time', `${duration}ms`);

  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 
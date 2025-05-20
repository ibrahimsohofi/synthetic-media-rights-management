import { NextRequest, NextResponse } from 'next/server';
import { detectSecurityThreats } from './threat-detection';
import { EnhancedMonitoringService } from '../monitoring/service';
import { rateLimit } from './rate-limit';

interface ValidationConfig {
  maxBodySize?: number;
  allowedMethods?: string[];
  requiredHeaders?: string[];
  allowedOrigins?: string[];
  validateContentType?: boolean;
}

const DEFAULT_CONFIG: ValidationConfig = {
  maxBodySize: 1024 * 1024, // 1MB
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  requiredHeaders: ['user-agent'],
  allowedOrigins: ['*'],
  validateContentType: true,
};

export async function validateRequest(
  request: NextRequest,
  config: ValidationConfig = {}
): Promise<NextResponse | null> {
  const validationConfig = { ...DEFAULT_CONFIG, ...config };
  const monitoringService = EnhancedMonitoringService.getInstance();

  try {
    // Check request method
    if (!validationConfig.allowedMethods?.includes(request.method)) {
      await monitoringService.trackSecurityEvent({
        type: 'invalid_method',
        timestamp: new Date(),
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: request.nextUrl.pathname,
        method: request.method,
        details: {
          allowedMethods: validationConfig.allowedMethods,
        },
        severity: 'medium',
      });
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Check origin
    const origin = request.headers.get('origin');
    if (
      validationConfig.allowedOrigins[0] !== '*' &&
      origin &&
      !validationConfig.allowedOrigins.includes(origin)
    ) {
      await monitoringService.trackSecurityEvent({
        type: 'invalid_origin',
        timestamp: new Date(),
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: request.nextUrl.pathname,
        method: request.method,
        details: {
          origin,
          allowedOrigins: validationConfig.allowedOrigins,
        },
        severity: 'medium',
      });
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      );
    }

    // Check required headers
    for (const header of validationConfig.requiredHeaders || []) {
      if (!request.headers.has(header)) {
        await monitoringService.trackSecurityEvent({
          type: 'missing_header',
          timestamp: new Date(),
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || undefined,
          endpoint: request.nextUrl.pathname,
          method: request.method,
          details: {
            missingHeader: header,
          },
          severity: 'low',
        });
        return NextResponse.json(
          { error: `Missing required header: ${header}` },
          { status: 400 }
        );
      }
    }

    // Check content type for non-GET requests
    if (
      validationConfig.validateContentType &&
      request.method !== 'GET' &&
      !request.headers.get('content-type')?.includes('application/json')
    ) {
      await monitoringService.trackSecurityEvent({
        type: 'invalid_content_type',
        timestamp: new Date(),
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: request.nextUrl.pathname,
        method: request.method,
        details: {
          contentType: request.headers.get('content-type'),
        },
        severity: 'low',
      });
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    // Check body size
    const contentLength = request.headers.get('content-length');
    if (
      contentLength &&
      parseInt(contentLength) > (validationConfig.maxBodySize || 0)
    ) {
      await monitoringService.trackSecurityEvent({
        type: 'request_too_large',
        timestamp: new Date(),
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: request.nextUrl.pathname,
        method: request.method,
        details: {
          contentLength: parseInt(contentLength),
          maxSize: validationConfig.maxBodySize,
        },
        severity: 'medium',
      });
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      );
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(
      request.ip || 'unknown',
      request.nextUrl.pathname,
      request.method
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Threat detection
    const context = {
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined,
      endpoint: request.nextUrl.pathname,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      body: request.method !== 'GET' ? await request.json().catch(() => ({})) : undefined,
    };

    await detectSecurityThreats(context);

    return null; // Request is valid
  } catch (error) {
    await monitoringService.logError({
      error: 'Request validation failed',
      stack: error instanceof Error ? error.stack : undefined,
      severity: 'high',
      category: 'security',
      timestamp: new Date(),
      endpoint: request.nextUrl.pathname,
      method: request.method,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Middleware factory for easy use in API routes
export function withRequestValidation(config?: ValidationConfig) {
  return async function middleware(request: NextRequest) {
    const validationResult = await validateRequest(request, config);
    if (validationResult) {
      return validationResult;
    }
    return NextResponse.next();
  };
} 
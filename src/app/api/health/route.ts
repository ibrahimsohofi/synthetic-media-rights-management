import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health check endpoint for monitoring deployment
 * GET /api/health
 */
export async function GET() {
  try {
    // Check database connection
    const dbCheck = await prisma.$queryRaw`SELECT 1 as check`;
    
    // Check Redis connection if applicable
    let redisStatus = 'not_configured';
    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL || '',
          token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
        });
        
        await redis.set('health_check', 'ok', { ex: 10 });
        const value = await redis.get('health_check');
        redisStatus = value === 'ok' ? 'connected' : 'error';
      } catch (error) {
        redisStatus = 'error';
      }
    }
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbCheck ? 'connected' : 'error',
      redis: redisStatus,
      uptime: process.uptime()
    }, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
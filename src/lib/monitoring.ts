import { redis } from './redis';
import { prisma } from './prisma';
import type { APIMetrics as PrismaAPIMetrics, ErrorLog } from '@prisma/client';

// Determine if we're running in Edge runtime
const isEdge = typeof EdgeRuntime !== 'undefined';

export interface APIMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  userId?: string;
}

export interface ErrorData {
  endpoint?: string;
  method?: string;
  errorCode?: string;
  errorMessage: string;
  timestamp: Date;
  userId?: string;
}

class MonitoringService {
  private static instance: MonitoringService;
  private readonly metricsKey = 'api:metrics';
  private readonly errorsKey = 'api:errors';
  private readonly retentionPeriod = 7 * 24 * 60 * 60; // 7 days in seconds

  private constructor() {}

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  async recordAPIMetrics(metrics: APIMetrics): Promise<void> {
    try {
      // Store in Redis for real-time monitoring
      await redis.lpush(this.metricsKey, JSON.stringify(metrics));
      await redis.ltrim(this.metricsKey, 0, 999); // Keep last 1000 metrics

      // Store in database for long-term storage if not in Edge
      if (!isEdge) {
        await prisma.aPIMetrics.create({
          data: {
            endpoint: metrics.endpoint,
            method: metrics.method,
            statusCode: metrics.statusCode,
            responseTime: metrics.duration,
            timestamp: metrics.timestamp,
          },
        });

        // Clean up old metrics
        await this.cleanupOldMetrics();
      }
    } catch (error) {
      console.error('Failed to track API metrics:', error);
    }
  }

  async recordError(error: ErrorData): Promise<void> {
    try {
      // Store in Redis for real-time monitoring
      await redis.lpush(this.errorsKey, JSON.stringify(error));
      await redis.ltrim(this.errorsKey, 0, 99); // Keep last 100 errors

      // Store in database for long-term storage if not in Edge
      if (!isEdge) {
        await prisma.errorLog.create({
          data: {
            error: error.errorMessage,
            endpoint: error.endpoint,
            method: error.method,
            timestamp: error.timestamp,
          },
        });
      }
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }

  async getRecentMetrics(limit: number = 100): Promise<APIMetrics[]> {
    try {
      const metrics = await redis.lrange(this.metricsKey, 0, limit - 1);
      return metrics.map((m) => JSON.parse(m as string));
    } catch (error) {
      console.error('Failed to get recent metrics:', error);
      return [];
    }
  }

  async getRecentErrors(limit: number = 100): Promise<ErrorData[]> {
    try {
      const errors = await redis.lrange(this.errorsKey, 0, limit - 1);
      return errors.map((e) => JSON.parse(e as string));
    } catch (error) {
      console.error('Failed to get recent errors:', error);
      return [];
    }
  }

  private async cleanupOldMetrics(): Promise<void> {
    if (isEdge) return; // Skip in Edge runtime
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days ago

      await prisma.aPIMetrics.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      await prisma.errorLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });
    } catch (error) {
      console.error('Failed to cleanup old metrics:', error);
    }
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: {
      database: 'connected' | 'disconnected';
      redis: 'connected' | 'disconnected';
    };
    metrics: {
      totalRequests: number;
      errorRate: number;
      averageResponseTime: number;
    };
  }> {
    if (isEdge) {
      // Simplified health check for Edge runtime
      try {
        // Check Redis connection
        await redis.ping();
        return {
          status: 'healthy',
          services: {
            database: 'connected', // Assume connected
            redis: 'connected',
          },
          metrics: {
            totalRequests: 0,
            errorRate: 0,
            averageResponseTime: 0,
          },
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          services: {
            database: 'disconnected',
            redis: 'disconnected',
          },
          metrics: {
            totalRequests: 0,
            errorRate: 0,
            averageResponseTime: 0,
          },
        };
      }
    }
    
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      const dbStatus: 'connected' | 'disconnected' = 'connected';

      // Check Redis connection
      await redis.ping();
      const redisStatus: 'connected' | 'disconnected' = 'connected';

      // Get metrics from the last hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const [totalRequests, errors, avgResponseTime] = await Promise.all([
        prisma.aPIMetrics.count({
          where: { timestamp: { gte: oneHourAgo } },
        }),
        prisma.errorLog.count({
          where: { timestamp: { gte: oneHourAgo } },
        }),
        prisma.aPIMetrics.aggregate({
          where: { timestamp: { gte: oneHourAgo } },
          _avg: { responseTime: true },
        }),
      ]);

      const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;

      return {
        status: dbStatus === 'connected' && redisStatus === 'connected' ? 'healthy' : 'unhealthy',
        services: {
          database: dbStatus,
          redis: redisStatus,
        },
        metrics: {
          totalRequests,
          errorRate,
          averageResponseTime: avgResponseTime._avg.responseTime ?? 0,
        },
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        services: {
          database: 'disconnected',
          redis: 'disconnected',
        },
        metrics: {
          totalRequests: 0,
          errorRate: 0,
          averageResponseTime: 0,
        },
      };
    }
  }
}

// Export a singleton instance
export const monitoring = MonitoringService.getInstance(); 
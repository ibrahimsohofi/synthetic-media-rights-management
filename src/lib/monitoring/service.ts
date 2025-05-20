import { redis } from '../redis';
import { prisma } from '../prisma';
import type {
  APIMetrics,
  ErrorLog,
  SecurityEvent,
  AlertConfig,
  SystemMetrics,
  MonitoringConfig,
  LogEntry,
} from './types';
import { sendEmailAlert } from '../alerts/email';
import { sendSlackAlert } from '../alerts/slack';
import { getSystemMetrics } from '../system/metrics';
import { rateLimit } from '../security/rate-limit';
import { detectSecurityThreats } from '../security/threat-detection';

export class EnhancedMonitoringService {
  private static instance: EnhancedMonitoringService;
  private readonly metricsKey = 'monitoring:metrics';
  private readonly errorsKey = 'monitoring:errors';
  private readonly securityKey = 'monitoring:security';
  private readonly systemKey = 'monitoring:system';
  private readonly alertsKey = 'monitoring:alerts';
  private readonly config: MonitoringConfig;
  private alertCooldowns: Map<string, number> = new Map();

  private constructor() {
    this.config = {
      metricsRetentionDays: Number(process.env.METRICS_RETENTION_DAYS) || 7,
      errorRetentionDays: Number(process.env.ERROR_RETENTION_DAYS) || 30,
      alertThresholds: {
        errorRate: Number(process.env.ALERT_THRESHOLD_ERROR_RATE) || 5,
        responseTime: Number(process.env.ALERT_THRESHOLD_RESPONSE_TIME) || 1000,
        cpuUsage: 80,
        memoryUsage: 85,
      },
      samplingRate: 1.0,
      enabledFeatures: {
        detailedMetrics: true,
        securityMonitoring: true,
        systemMetrics: true,
        alerting: true,
      },
    };
  }

  static getInstance(): EnhancedMonitoringService {
    if (!EnhancedMonitoringService.instance) {
      EnhancedMonitoringService.instance = new EnhancedMonitoringService();
    }
    return EnhancedMonitoringService.instance;
  }

  async trackAPIMetrics(metrics: APIMetrics): Promise<void> {
    try {
      if (Math.random() > this.config.samplingRate) return;

      // Store in Redis for real-time monitoring
      await redis.lpush(this.metricsKey, JSON.stringify(metrics));
      await redis.ltrim(this.metricsKey, 0, 999); // Keep last 1000 metrics

      // Store in database for long-term storage
      await prisma.aPIMetrics.create({
        data: {
          endpoint: metrics.endpoint,
          method: metrics.method,
          statusCode: metrics.statusCode,
          responseTime: metrics.responseTime,
          timestamp: metrics.timestamp,
          userAgent: metrics.userAgent,
          ipAddress: metrics.ipAddress,
          requestSize: metrics.requestSize,
          responseSize: metrics.responseSize,
          cacheStatus: metrics.cacheStatus,
          databaseQueries: metrics.databaseQueries,
          databaseQueryTime: metrics.databaseQueryTime,
          memoryUsage: metrics.memoryUsage,
        },
      });

      // Check for alert conditions
      await this.checkAlertConditions(metrics);

      // Clean up old metrics
      await this.cleanupOldMetrics();
    } catch (error) {
      await this.logError({
        error: 'Failed to track API metrics',
        stack: error instanceof Error ? error.stack : undefined,
        severity: 'high',
        category: 'monitoring',
      });
    }
  }

  async logError(error: ErrorLog): Promise<void> {
    try {
      // Store in Redis for real-time monitoring
      await redis.lpush(this.errorsKey, JSON.stringify(error));
      await redis.ltrim(this.errorsKey, 0, 99); // Keep last 100 errors

      // Store in database for long-term storage
      await prisma.errorLog.create({
        data: {
          error: error.error,
          stack: error.stack,
          endpoint: error.endpoint,
          method: error.method,
          timestamp: error.timestamp,
          userAgent: error.userAgent,
          ipAddress: error.ipAddress,
          requestBody: error.requestBody,
          severity: error.severity,
          category: error.category,
          context: error.context,
        },
      });

      // Check for alert conditions
      if (error.severity === 'critical' || error.severity === 'high') {
        await this.sendAlert({
          id: `error-${Date.now()}`,
          name: 'High Severity Error',
          type: 'error_rate',
          condition: {
            metric: 'error_severity',
            operator: 'eq',
            threshold: 1,
            window: 0,
          },
          channels: ['email', 'slack'],
          recipients: [process.env.ALERT_EMAIL_TO || ''],
          cooldown: 300,
          enabled: true,
        }, {
          error: error.error,
          severity: error.severity,
          endpoint: error.endpoint,
        });
      }
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }

  async trackSecurityEvent(event: SecurityEvent): Promise<void> {
    if (!this.config.enabledFeatures.securityMonitoring) return;

    try {
      // Store in Redis for real-time monitoring
      await redis.lpush(this.securityKey, JSON.stringify(event));
      await redis.ltrim(this.securityKey, 0, 99); // Keep last 100 security events

      // Store in database
      await prisma.securityEvent.create({
        data: {
          type: event.type,
          timestamp: event.timestamp,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          endpoint: event.endpoint,
          method: event.method,
          details: event.details,
          severity: event.severity,
        },
      });

      // Check for alert conditions
      if (event.severity === 'critical' || event.severity === 'high') {
        await this.sendAlert({
          id: `security-${Date.now()}`,
          name: 'Security Alert',
          type: 'security',
          condition: {
            metric: 'security_event',
            operator: 'eq',
            threshold: 1,
            window: 0,
          },
          channels: ['email', 'slack'],
          recipients: [process.env.ALERT_EMAIL_TO || ''],
          cooldown: 300,
          enabled: true,
        }, {
          type: event.type,
          severity: event.severity,
          ipAddress: event.ipAddress,
        });
      }
    } catch (error) {
      await this.logError({
        error: 'Failed to track security event',
        stack: error instanceof Error ? error.stack : undefined,
        severity: 'high',
        category: 'security',
      });
    }
  }

  async trackSystemMetrics(): Promise<void> {
    if (!this.config.enabledFeatures.systemMetrics) return;

    try {
      const metrics = await getSystemMetrics();
      
      // Store in Redis for real-time monitoring
      await redis.lpush(this.systemKey, JSON.stringify(metrics));
      await redis.ltrim(this.systemKey, 0, 99); // Keep last 100 system metrics

      // Store in database
      await prisma.systemMetrics.create({
        data: {
          timestamp: metrics.timestamp,
          cpuUsage: metrics.cpu.usage,
          cpuLoad: metrics.cpu.load,
          memoryTotal: metrics.memory.total,
          memoryUsed: metrics.memory.used,
          memoryFree: metrics.memory.free,
          diskTotal: metrics.disk.total,
          diskUsed: metrics.disk.used,
          diskFree: metrics.disk.free,
          networkBytesIn: metrics.network.bytesIn,
          networkBytesOut: metrics.network.bytesOut,
          networkConnections: metrics.network.connections,
        },
      });

      // Check for alert conditions
      if (metrics.cpu.usage > this.config.alertThresholds.cpuUsage) {
        await this.sendAlert({
          id: `cpu-${Date.now()}`,
          name: 'High CPU Usage',
          type: 'system',
          condition: {
            metric: 'cpu_usage',
            operator: 'gt',
            threshold: this.config.alertThresholds.cpuUsage,
            window: 300,
          },
          channels: ['email', 'slack'],
          recipients: [process.env.ALERT_EMAIL_TO || ''],
          cooldown: 900,
          enabled: true,
        }, {
          cpuUsage: metrics.cpu.usage,
          threshold: this.config.alertThresholds.cpuUsage,
        });
      }

      if (metrics.memory.used / metrics.memory.total * 100 > this.config.alertThresholds.memoryUsage) {
        await this.sendAlert({
          id: `memory-${Date.now()}`,
          name: 'High Memory Usage',
          type: 'system',
          condition: {
            metric: 'memory_usage',
            operator: 'gt',
            threshold: this.config.alertThresholds.memoryUsage,
            window: 300,
          },
          channels: ['email', 'slack'],
          recipients: [process.env.ALERT_EMAIL_TO || ''],
          cooldown: 900,
          enabled: true,
        }, {
          memoryUsage: (metrics.memory.used / metrics.memory.total) * 100,
          threshold: this.config.alertThresholds.memoryUsage,
        });
      }
    } catch (error) {
      await this.logError({
        error: 'Failed to track system metrics',
        stack: error instanceof Error ? error.stack : undefined,
        severity: 'high',
        category: 'system',
      });
    }
  }

  private async checkAlertConditions(metrics: APIMetrics): Promise<void> {
    if (!this.config.enabledFeatures.alerting) return;

    // Check response time
    if (metrics.responseTime > this.config.alertThresholds.responseTime) {
      await this.sendAlert({
        id: `response-time-${Date.now()}`,
        name: 'High Response Time',
        type: 'response_time',
        condition: {
          metric: 'response_time',
          operator: 'gt',
          threshold: this.config.alertThresholds.responseTime,
          window: 300,
        },
        channels: ['email', 'slack'],
        recipients: [process.env.ALERT_EMAIL_TO || ''],
        cooldown: 900,
        enabled: true,
      }, {
        endpoint: metrics.endpoint,
        responseTime: metrics.responseTime,
        threshold: this.config.alertThresholds.responseTime,
      });
    }

    // Check error rate
    const recentErrors = await this.getRecentErrors(300); // Last 5 minutes
    const errorRate = (recentErrors.length / 300) * 100;
    if (errorRate > this.config.alertThresholds.errorRate) {
      await this.sendAlert({
        id: `error-rate-${Date.now()}`,
        name: 'High Error Rate',
        type: 'error_rate',
        condition: {
          metric: 'error_rate',
          operator: 'gt',
          threshold: this.config.alertThresholds.errorRate,
          window: 300,
        },
        channels: ['email', 'slack'],
        recipients: [process.env.ALERT_EMAIL_TO || ''],
        cooldown: 900,
        enabled: true,
      }, {
        errorRate,
        threshold: this.config.alertThresholds.errorRate,
      });
    }
  }

  private async sendAlert(alert: AlertConfig, data: Record<string, unknown>): Promise<void> {
    const now = Date.now();
    const lastAlert = this.alertCooldowns.get(alert.id) || 0;
    
    if (now - lastAlert < alert.cooldown * 1000) {
      return; // Still in cooldown period
    }

    try {
      const message = this.formatAlertMessage(alert, data);
      
      if (alert.channels.includes('email')) {
        await sendEmailAlert(alert.recipients, message);
      }
      
      if (alert.channels.includes('slack')) {
        await sendSlackAlert(message);
      }

      this.alertCooldowns.set(alert.id, now);
    } catch (error) {
      await this.logError({
        error: 'Failed to send alert',
        stack: error instanceof Error ? error.stack : undefined,
        severity: 'high',
        category: 'alerting',
      });
    }
  }

  private formatAlertMessage(alert: AlertConfig, data: Record<string, unknown>): string {
    return JSON.stringify({
      title: alert.name,
      timestamp: new Date().toISOString(),
      type: alert.type,
      condition: alert.condition,
      data,
    }, null, 2);
  }

  async getRecentMetrics(limit: number = 100): Promise<APIMetrics[]> {
    try {
      const metrics = await redis.lrange(this.metricsKey, 0, limit - 1);
      return metrics.map((m) => JSON.parse(m));
    } catch (error) {
      await this.logError({
        error: 'Failed to get recent metrics',
        stack: error instanceof Error ? error.stack : undefined,
        severity: 'medium',
        category: 'monitoring',
      });
      return [];
    }
  }

  async getRecentErrors(limit: number = 100): Promise<ErrorLog[]> {
    try {
      const errors = await redis.lrange(this.errorsKey, 0, limit - 1);
      return errors.map((e) => JSON.parse(e));
    } catch (error) {
      await this.logError({
        error: 'Failed to get recent errors',
        stack: error instanceof Error ? error.stack : undefined,
        severity: 'medium',
        category: 'monitoring',
      });
      return [];
    }
  }

  async getRecentSecurityEvents(limit: number = 100): Promise<SecurityEvent[]> {
    try {
      const events = await redis.lrange(this.securityKey, 0, limit - 1);
      return events.map((e) => JSON.parse(e));
    } catch (error) {
      await this.logError({
        error: 'Failed to get recent security events',
        stack: error instanceof Error ? error.stack : undefined,
        severity: 'medium',
        category: 'security',
      });
      return [];
    }
  }

  async getRecentSystemMetrics(limit: number = 100): Promise<SystemMetrics[]> {
    try {
      const metrics = await redis.lrange(this.systemKey, 0, limit - 1);
      return metrics.map((m) => JSON.parse(m));
    } catch (error) {
      await this.logError({
        error: 'Failed to get recent system metrics',
        stack: error instanceof Error ? error.stack : undefined,
        severity: 'medium',
        category: 'system',
      });
      return [];
    }
  }

  private async cleanupOldMetrics(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.metricsRetentionDays);

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

      await prisma.securityEvent.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      await prisma.systemMetrics.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });
    } catch (error) {
      await this.logError({
        error: 'Failed to cleanup old metrics',
        stack: error instanceof Error ? error.stack : undefined,
        severity: 'high',
        category: 'monitoring',
      });
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
      cpuUsage: number;
      memoryUsage: number;
    };
  }> {
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

      const [totalRequests, errors, avgResponseTime, systemMetrics] = await Promise.all([
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
        this.getRecentSystemMetrics(1),
      ]);

      const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
      const latestSystemMetrics = systemMetrics[0] || null;

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
          cpuUsage: latestSystemMetrics?.cpu.usage ?? 0,
          memoryUsage: latestSystemMetrics
            ? (latestSystemMetrics.memory.used / latestSystemMetrics.memory.total) * 100
            : 0,
        },
      };
    } catch (error) {
      await this.logError({
        error: 'Health check failed',
        stack: error instanceof Error ? error.stack : undefined,
        severity: 'high',
        category: 'monitoring',
      });

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
          cpuUsage: 0,
          memoryUsage: 0,
        },
      };
    }
  }
} 
import { EnhancedMonitoringService } from '../service';
import { redis } from '../../redis';
import { prisma } from '../../prisma';
import type { APIMetrics, ErrorLog, SecurityEvent, SystemMetrics } from '../types';

// Mock Redis and Prisma
jest.mock('../../redis', () => ({
  redis: {
    lpush: jest.fn(),
    ltrim: jest.fn(),
    lrange: jest.fn(),
  },
}));

jest.mock('../../prisma', () => ({
  prisma: {
    aPIMetrics: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    errorLog: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    securityEvent: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    systemMetrics: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

describe('EnhancedMonitoringService', () => {
  let service: EnhancedMonitoringService;

  beforeEach(() => {
    service = EnhancedMonitoringService.getInstance();
    jest.clearAllMocks();
  });

  describe('trackAPIMetrics', () => {
    const mockMetrics: APIMetrics = {
      endpoint: '/api/test',
      method: 'GET',
      statusCode: 200,
      responseTime: 100,
      timestamp: new Date(),
    };

    it('should store metrics in Redis and database', async () => {
      await service.trackAPIMetrics(mockMetrics);

      expect(redis.lpush).toHaveBeenCalledWith(
        'monitoring:metrics',
        JSON.stringify(mockMetrics)
      );
      expect(redis.ltrim).toHaveBeenCalledWith('monitoring:metrics', 0, 999);
      expect(prisma.aPIMetrics.create).toHaveBeenCalledWith({
        data: mockMetrics,
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Test error');
      (redis.lpush as jest.Mock).mockRejectedValueOnce(error);

      await service.trackAPIMetrics(mockMetrics);

      expect(prisma.errorLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          error: 'Failed to track API metrics',
          severity: 'high',
          category: 'monitoring',
        }),
      });
    });
  });

  describe('logError', () => {
    const mockError: ErrorLog = {
      error: 'Test error',
      stack: 'Error stack',
      severity: 'high',
      category: 'api',
      timestamp: new Date(),
    };

    it('should store error in Redis and database', async () => {
      await service.logError(mockError);

      expect(redis.lpush).toHaveBeenCalledWith(
        'monitoring:errors',
        JSON.stringify(mockError)
      );
      expect(redis.ltrim).toHaveBeenCalledWith('monitoring:errors', 0, 99);
      expect(prisma.errorLog.create).toHaveBeenCalledWith({
        data: mockError,
      });
    });

    it('should send alert for high severity errors', async () => {
      await service.logError(mockError);

      expect(prisma.errorLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          error: 'Test error',
          severity: 'high',
        }),
      });
    });
  });

  describe('trackSecurityEvent', () => {
    const mockEvent: SecurityEvent = {
      type: 'rate_limit',
      timestamp: new Date(),
      ipAddress: '127.0.0.1',
      endpoint: '/api/test',
      method: 'GET',
      details: {},
      severity: 'high',
    };

    it('should store security event in Redis and database', async () => {
      await service.trackSecurityEvent(mockEvent);

      expect(redis.lpush).toHaveBeenCalledWith(
        'monitoring:security',
        JSON.stringify(mockEvent)
      );
      expect(redis.ltrim).toHaveBeenCalledWith('monitoring:security', 0, 99);
      expect(prisma.securityEvent.create).toHaveBeenCalledWith({
        data: mockEvent,
      });
    });

    it('should send alert for high severity events', async () => {
      await service.trackSecurityEvent(mockEvent);

      expect(prisma.securityEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'rate_limit',
          severity: 'high',
        }),
      });
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy status when all services are up', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ 1: 1 }]);
      (redis.ping as jest.Mock).mockResolvedValueOnce('PONG');
      (prisma.aPIMetrics.count as jest.Mock).mockResolvedValueOnce(100);
      (prisma.errorLog.count as jest.Mock).mockResolvedValueOnce(5);
      (prisma.aPIMetrics.aggregate as jest.Mock).mockResolvedValueOnce({
        _avg: { responseTime: 100 },
      });

      const health = await service.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.services.database).toBe('connected');
      expect(health.services.redis).toBe('connected');
      expect(health.metrics.errorRate).toBe(5);
      expect(health.metrics.averageResponseTime).toBe(100);
    });

    it('should return unhealthy status when services are down', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const health = await service.getHealthStatus();

      expect(health.status).toBe('unhealthy');
      expect(health.services.database).toBe('disconnected');
      expect(health.services.redis).toBe('disconnected');
    });
  });

  describe('cleanupOldMetrics', () => {
    it('should delete old metrics from database', async () => {
      await service['cleanupOldMetrics']();

      expect(prisma.aPIMetrics.deleteMany).toHaveBeenCalled();
      expect(prisma.errorLog.deleteMany).toHaveBeenCalled();
      expect(prisma.securityEvent.deleteMany).toHaveBeenCalled();
      expect(prisma.systemMetrics.deleteMany).toHaveBeenCalled();
    });
  });
}); 
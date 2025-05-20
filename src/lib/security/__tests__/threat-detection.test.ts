import { ThreatDetection, ThreatEvent } from '../threat-detection';
import { IPReputationTracker } from '../ip-reputation';
import { GeoBlocking } from '../geo-blocking';
import { EnhancedMonitoringService } from '@/lib/monitoring/service';
import { redis } from '@/lib/redis';

// Mock dependencies
jest.mock('@/lib/redis');
jest.mock('@/lib/monitoring/service');
jest.mock('../ip-reputation');
jest.mock('../geo-blocking');

describe('ThreatDetection', () => {
  let threatDetection: ThreatDetection;
  let mockIPReputation: jest.Mocked<IPReputationTracker>;
  let mockGeoBlocking: jest.Mocked<GeoBlocking>;
  let mockMonitoringService: jest.Mocked<typeof EnhancedMonitoringService>;

  const mockRequest = {
    method: 'GET',
    path: '/api/test',
    headers: {
      'user-agent': 'Mozilla/5.0',
      'content-type': 'application/json',
    },
    body: '{"test": "data"}',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock IP reputation
    mockIPReputation = {
      getReputation: jest.fn().mockResolvedValue({ score: 0, isSuspicious: false }),
      updateReputation: jest.fn(),
    } as any;

    // Setup mock geo blocking
    mockGeoBlocking = {
      isBlocked: jest.fn().mockResolvedValue(false),
    } as any;

    // Setup mock monitoring service
    mockMonitoringService = {
      getInstance: jest.fn().mockReturnValue({
        trackSecurityEvent: jest.fn(),
      }),
    } as any;
    (EnhancedMonitoringService as jest.Mock) = mockMonitoringService;

    threatDetection = new ThreatDetection(
      {},
      mockIPReputation,
      mockGeoBlocking
    );
  });

  describe('analyzeRequest', () => {
    it('should detect SQL injection attempts', async () => {
      const sqlInjectionRequest = {
        ...mockRequest,
        body: '{"query": "SELECT * FROM users WHERE id = 1 OR 1=1"}',
      };

      const threats = await threatDetection.analyzeRequest(
        '1.2.3.4',
        'req-123',
        sqlInjectionRequest
      );

      expect(threats).toContainEqual(expect.objectContaining({
        type: 'sql_injection',
        severity: 'high',
        details: expect.objectContaining({
          category: 'injection',
          description: 'Potential SQL injection attempt',
        }),
      }));
    });

    it('should detect XSS attempts', async () => {
      const xssRequest = {
        ...mockRequest,
        body: '{"content": "<script>alert(1)</script>"}',
      };

      const threats = await threatDetection.analyzeRequest(
        '1.2.3.4',
        'req-123',
        xssRequest
      );

      expect(threats).toContainEqual(expect.objectContaining({
        type: 'xss',
        severity: 'high',
        details: expect.objectContaining({
          category: 'xss',
          description: 'Potential XSS attack attempt',
        }),
      }));
    });

    it('should detect high request rates', async () => {
      // Simulate high request rate
      for (let i = 0; i < 150; i++) {
        await threatDetection.analyzeRequest('1.2.3.4', `req-${i}`, mockRequest);
      }

      const threats = await threatDetection.analyzeRequest(
        '1.2.3.4',
        'req-151',
        mockRequest
      );

      expect(threats).toContainEqual(expect.objectContaining({
        type: 'high_request_rate',
        severity: 'medium',
        details: expect.objectContaining({
          description: 'Request rate exceeds threshold',
        }),
      }));
    });

    it('should detect suspicious IPs', async () => {
      mockIPReputation.getReputation.mockResolvedValueOnce({
        score: 80,
        isSuspicious: true,
      });

      const threats = await threatDetection.analyzeRequest(
        '1.2.3.4',
        'req-123',
        mockRequest
      );

      expect(threats).toContainEqual(expect.objectContaining({
        type: 'suspicious_ip',
        severity: 'high',
        details: expect.objectContaining({
          description: 'IP has high suspicious score',
          metrics: expect.objectContaining({
            suspiciousScore: 80,
          }),
        }),
      }));
    });

    it('should detect geo-blocked IPs', async () => {
      mockGeoBlocking.isBlocked.mockResolvedValueOnce(true);

      const threats = await threatDetection.analyzeRequest(
        '1.2.3.4',
        'req-123',
        mockRequest
      );

      expect(threats).toContainEqual(expect.objectContaining({
        type: 'geo_blocked',
        severity: 'medium',
        details: expect.objectContaining({
          description: 'IP is blocked by geographic policy',
        }),
      }));
    });

    it('should handle multiple threats simultaneously', async () => {
      mockIPReputation.getReputation.mockResolvedValueOnce({
        score: 80,
        isSuspicious: true,
      });

      const multiThreatRequest = {
        ...mockRequest,
        body: '{"query": "SELECT * FROM users WHERE id = 1 OR 1=1"}',
      };

      const threats = await threatDetection.analyzeRequest(
        '1.2.3.4',
        'req-123',
        multiThreatRequest
      );

      expect(threats.length).toBeGreaterThan(1);
      expect(threats).toContainEqual(expect.objectContaining({
        type: 'sql_injection',
      }));
      expect(threats).toContainEqual(expect.objectContaining({
        type: 'suspicious_ip',
      }));
    });
  });

  describe('configuration management', () => {
    it('should update configuration', async () => {
      const newConfig = {
        thresholds: {
          requestRate: 200,
          errorRate: 0.2,
          suspiciousScore: 80,
          scanThreshold: 100,
        },
      };

      await threatDetection.updateConfig(newConfig);
      const config = await threatDetection.getConfig();

      expect(config.thresholds).toEqual(newConfig.thresholds);
      expect(mockMonitoringService.getInstance().trackSecurityEvent)
        .toHaveBeenCalledWith(expect.objectContaining({
          type: 'threat_detection_config_update',
          severity: 'low',
        }));
    });

    it('should maintain existing config for unspecified values', async () => {
      const originalConfig = await threatDetection.getConfig();
      const newConfig = {
        thresholds: {
          requestRate: 200,
        },
      };

      await threatDetection.updateConfig(newConfig);
      const updatedConfig = await threatDetection.getConfig();

      expect(updatedConfig.thresholds.requestRate).toBe(200);
      expect(updatedConfig.thresholds.errorRate).toBe(originalConfig.thresholds.errorRate);
    });
  });

  describe('rate tracking', () => {
    it('should track request counts', async () => {
      await threatDetection.analyzeRequest('1.2.3.4', 'req-1', mockRequest);
      await threatDetection.analyzeRequest('1.2.3.4', 'req-2', mockRequest);
      await threatDetection.analyzeRequest('1.2.3.4', 'req-3', mockRequest);

      const threats = await threatDetection.analyzeRequest(
        '1.2.3.4',
        'req-4',
        mockRequest
      );

      // Should not trigger high request rate for 4 requests
      expect(threats).not.toContainEqual(expect.objectContaining({
        type: 'high_request_rate',
      }));
    });

    it('should clear counts', async () => {
      await threatDetection.analyzeRequest('1.2.3.4', 'req-1', mockRequest);
      await threatDetection.clearCounts();
      await threatDetection.analyzeRequest('1.2.3.4', 'req-2', mockRequest);

      const threats = await threatDetection.analyzeRequest(
        '1.2.3.4',
        'req-3',
        mockRequest
      );

      // Should not trigger high request rate after clearing
      expect(threats).not.toContainEqual(expect.objectContaining({
        type: 'high_request_rate',
      }));
    });
  });

  describe('threat handling', () => {
    it('should log threats when configured', async () => {
      const sqlInjectionRequest = {
        ...mockRequest,
        body: '{"query": "SELECT * FROM users WHERE id = 1 OR 1=1"}',
      };

      await threatDetection.analyzeRequest(
        '1.2.3.4',
        'req-123',
        sqlInjectionRequest
      );

      expect(mockMonitoringService.getInstance().trackSecurityEvent)
        .toHaveBeenCalledWith(expect.objectContaining({
          type: 'sql_injection',
          severity: 'high',
        }));
    });

    it('should update IP reputation for threats', async () => {
      const sqlInjectionRequest = {
        ...mockRequest,
        body: '{"query": "SELECT * FROM users WHERE id = 1 OR 1=1"}',
      };

      await threatDetection.analyzeRequest(
        '1.2.3.4',
        'req-123',
        sqlInjectionRequest
      );

      expect(mockIPReputation.updateReputation)
        .toHaveBeenCalledWith(
          '1.2.3.4',
          expect.objectContaining({
            type: 'sql_injection',
            severity: 'high',
          })
        );
    });
  });
}); 
import { IPReputationTracker } from '../ip-reputation';
import { redis } from '@/lib/redis';
import { EnhancedMonitoringService } from '../../monitoring/service';

// Mock Redis
jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  },
}));

// Mock monitoring service
jest.mock('../../monitoring/service', () => ({
  EnhancedMonitoringService: {
    getInstance: jest.fn(() => ({
      trackSecurityEvent: jest.fn(),
    })),
  },
}));

describe('IPReputationTracker', () => {
  let tracker: IPReputationTracker;
  const mockIP = '192.168.1.1';
  const mockEvent = {
    type: 'brute_force_attempt',
    severity: 'high' as const,
    ipAddress: mockIP,
    timestamp: new Date(),
    details: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    tracker = new IPReputationTracker({
      scoreThreshold: 50,
      decayRate: 0.1,
      maxScore: 100,
      minScore: 0,
      updateInterval: 1000, // 1 second for testing
    });
  });

  describe('updateReputation', () => {
    it('should initialize reputation for new IP', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.set as jest.Mock).mockResolvedValue('OK');

      await tracker.updateReputation(mockIP, mockEvent);

      expect(redis.set).toHaveBeenCalledWith(
        expect.stringContaining('ip_reputation:'),
        expect.stringContaining('"score":80'), // 100 - 20 (brute force penalty)
        expect.any(String)
      );
    });

    it('should update existing reputation', async () => {
      const existingData = {
        score: 90,
        lastUpdate: Date.now() - 2000, // 2 seconds ago
        events: [],
        metadata: {
          firstSeen: Date.now() - 3600000,
          lastSeen: Date.now() - 2000,
          totalRequests: 10,
          failedRequests: 2,
          blockedRequests: 1,
        },
      };
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(existingData));
      (redis.set as jest.Mock).mockResolvedValue('OK');

      await tracker.updateReputation(mockIP, mockEvent);

      const updatedData = JSON.parse((redis.set as jest.Mock).mock.calls[0][1]);
      expect(updatedData.score).toBeLessThan(90); // Score should decrease
      expect(updatedData.metadata.totalRequests).toBe(11);
      expect(updatedData.metadata.failedRequests).toBe(3);
      expect(updatedData.metadata.blockedRequests).toBe(2);
    });

    it('should apply score decay over time', async () => {
      const existingData = {
        score: 90,
        lastUpdate: Date.now() - 5000, // 5 seconds ago
        events: [],
        metadata: {
          firstSeen: Date.now() - 3600000,
          lastSeen: Date.now() - 5000,
          totalRequests: 10,
          failedRequests: 2,
          blockedRequests: 1,
        },
      };
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(existingData));
      (redis.set as jest.Mock).mockResolvedValue('OK');

      await tracker.updateReputation(mockIP, mockEvent);

      const updatedData = JSON.parse((redis.set as jest.Mock).mock.calls[0][1]);
      // Score should decay by 0.1 per second for 5 seconds, then decrease by 20 for the event
      expect(updatedData.score).toBeCloseTo(90 - 0.5 - 20, 1);
    });

    it('should log significant score changes', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.set as jest.Mock).mockResolvedValue('OK');

      await tracker.updateReputation(mockIP, {
        ...mockEvent,
        type: 'sql_injection',
        severity: 'critical',
      });

      const monitoringService = EnhancedMonitoringService.getInstance();
      expect(monitoringService.trackSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ip_reputation_change',
          severity: 'high',
          ipAddress: mockIP,
          details: expect.objectContaining({
            change: -60, // -30 base * 2 critical multiplier
          }),
        })
      );
    });
  });

  describe('getReputation', () => {
    it('should return default values for new IP', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);

      const reputation = await tracker.getReputation(mockIP);

      expect(reputation).toEqual({
        score: 100,
        isSuspicious: false,
        metadata: expect.objectContaining({
          totalRequests: 0,
          failedRequests: 0,
          blockedRequests: 0,
        }),
        recentEvents: [],
      });
    });

    it('should return existing reputation with decay applied', async () => {
      const existingData = {
        score: 90,
        lastUpdate: Date.now() - 5000,
        events: [
          { type: 'failed_login', timestamp: Date.now() - 1000, score: -5 },
        ],
        metadata: {
          firstSeen: Date.now() - 3600000,
          lastSeen: Date.now() - 5000,
          totalRequests: 10,
          failedRequests: 2,
          blockedRequests: 1,
        },
      };
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(existingData));
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const reputation = await tracker.getReputation(mockIP);

      expect(reputation.score).toBeCloseTo(90 - 0.5, 1); // Decay applied
      expect(reputation.isSuspicious).toBe(false);
      expect(reputation.recentEvents).toHaveLength(1);
    });

    it('should mark IP as suspicious when score is below threshold', async () => {
      const existingData = {
        score: 40,
        lastUpdate: Date.now(),
        events: [],
        metadata: {
          firstSeen: Date.now() - 3600000,
          lastSeen: Date.now(),
          totalRequests: 10,
          failedRequests: 5,
          blockedRequests: 3,
        },
      };
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(existingData));

      const reputation = await tracker.getReputation(mockIP);

      expect(reputation.isSuspicious).toBe(true);
    });
  });

  describe('getSuspiciousIPs', () => {
    it('should return list of suspicious IPs', async () => {
      const mockIPs = {
        'ip_reputation:192.168.1.1': JSON.stringify({
          score: 40,
          lastUpdate: Date.now(),
          events: [],
          metadata: {
            firstSeen: Date.now() - 3600000,
            lastSeen: Date.now(),
            totalRequests: 10,
            failedRequests: 5,
            blockedRequests: 3,
          },
        }),
        'ip_reputation:192.168.1.2': JSON.stringify({
          score: 60,
          lastUpdate: Date.now(),
          events: [],
          metadata: {
            firstSeen: Date.now() - 3600000,
            lastSeen: Date.now(),
            totalRequests: 5,
            failedRequests: 1,
            blockedRequests: 0,
          },
        }),
      };

      (redis.keys as jest.Mock).mockResolvedValue(Object.keys(mockIPs));
      (redis.get as jest.Mock).mockImplementation((key) => Promise.resolve(mockIPs[key]));

      const suspiciousIPs = await tracker.getSuspiciousIPs();

      expect(suspiciousIPs).toHaveLength(1);
      expect(suspiciousIPs[0].ipAddress).toBe('192.168.1.1');
      expect(suspiciousIPs[0].score).toBe(40);
    });

    it('should respect limit parameter', async () => {
      const mockIPs = Array.from({ length: 10 }, (_, i) => ({
        key: `ip_reputation:192.168.1.${i}`,
        data: {
          score: 30 + i,
          lastUpdate: Date.now(),
          events: [],
          metadata: {
            firstSeen: Date.now() - 3600000,
            lastSeen: Date.now(),
            totalRequests: 10,
            failedRequests: 5,
            blockedRequests: 3,
          },
        },
      }));

      (redis.keys as jest.Mock).mockResolvedValue(mockIPs.map(ip => ip.key));
      (redis.get as jest.Mock).mockImplementation((key) => {
        const ip = mockIPs.find(ip => ip.key === key);
        return Promise.resolve(ip ? JSON.stringify(ip.data) : null);
      });

      const suspiciousIPs = await tracker.getSuspiciousIPs(5);

      expect(suspiciousIPs).toHaveLength(5);
      expect(suspiciousIPs[0].score).toBe(30); // Lowest score first
    });
  });

  describe('resetReputation', () => {
    it('should delete reputation data and log event', async () => {
      (redis.del as jest.Mock).mockResolvedValue(1);

      await tracker.resetReputation(mockIP);

      expect(redis.del).toHaveBeenCalledWith(
        expect.stringContaining('ip_reputation:')
      );

      const monitoringService = EnhancedMonitoringService.getInstance();
      expect(monitoringService.trackSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ip_reputation_reset',
          severity: 'medium',
          ipAddress: mockIP,
        })
      );
    });
  });
}); 
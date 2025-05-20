import { BruteForceDetector } from '../brute-force-detection';
import { redis } from '@/lib/redis';
import { EnhancedMonitoringService } from '../../monitoring/service';

// Mock Redis
jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ttl: jest.fn(),
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

describe('BruteForceDetector', () => {
  let detector: BruteForceDetector;
  const mockIP = '192.168.1.1';
  const mockEndpoint = '/api/auth/login';

  beforeEach(() => {
    jest.clearAllMocks();
    detector = new BruteForceDetector({
      maxAttempts: 3,
      windowMs: 1000,
      blockDurationMs: 2000,
      endpoints: [mockEndpoint],
    });
  });

  describe('trackAttempt', () => {
    it('should allow attempts within limit', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const result = await detector.trackAttempt(mockIP, mockEndpoint, false);
      expect(result.blocked).toBe(false);
      expect(result.attemptsRemaining).toBe(2);
    });

    it('should block after max attempts', async () => {
      const attemptData = {
        count: 2,
        firstAttempt: Date.now() - 500,
        lastAttempt: Date.now() - 100,
      };
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(attemptData));
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const result = await detector.trackAttempt(mockIP, mockEndpoint, false);
      expect(result.blocked).toBe(true);
      expect(result.attemptsRemaining).toBe(0);

      // Verify block was set
      expect(redis.set).toHaveBeenCalledWith(
        expect.stringContaining('brute_force_block'),
        '1',
        'PX',
        2000
      );

      // Verify security event was logged
      const monitoringService = EnhancedMonitoringService.getInstance();
      expect(monitoringService.trackSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'brute_force_attempt',
          severity: 'high',
          ipAddress: mockIP,
          endpoint: mockEndpoint,
        })
      );
    });

    it('should reset counter on successful attempt', async () => {
      const attemptData = {
        count: 2,
        firstAttempt: Date.now() - 500,
        lastAttempt: Date.now() - 100,
      };
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(attemptData));
      (redis.del as jest.Mock).mockResolvedValue(1);

      const result = await detector.trackAttempt(mockIP, mockEndpoint, true);
      expect(result.blocked).toBe(false);
      expect(result.attemptsRemaining).toBe(3);
      expect(redis.del).toHaveBeenCalled();
    });

    it('should ignore non-monitored endpoints', async () => {
      const result = await detector.trackAttempt(mockIP, '/api/other', false);
      expect(result.blocked).toBe(false);
      expect(result.attemptsRemaining).toBe(3);
      expect(redis.get).not.toHaveBeenCalled();
    });
  });

  describe('isBlocked', () => {
    it('should return true when IP is blocked', async () => {
      (redis.get as jest.Mock).mockResolvedValue('1');
      const blocked = await detector.isBlocked(mockIP);
      expect(blocked).toBe(true);
    });

    it('should return false when IP is not blocked', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      const blocked = await detector.isBlocked(mockIP);
      expect(blocked).toBe(false);
    });
  });

  describe('getBlockTimeRemaining', () => {
    it('should return remaining block time', async () => {
      (redis.ttl as jest.Mock).mockResolvedValue(1000);
      const remaining = await detector.getBlockTimeRemaining(mockIP);
      expect(remaining).toBe(1000000); // 1000 seconds in milliseconds
    });

    it('should return 0 when not blocked', async () => {
      (redis.ttl as jest.Mock).mockResolvedValue(-1);
      const remaining = await detector.getBlockTimeRemaining(mockIP);
      expect(remaining).toBe(0);
    });
  });

  describe('getAttemptStats', () => {
    it('should return attempt statistics', async () => {
      const now = Date.now();
      const attemptData = {
        count: 2,
        firstAttempt: now - 1000,
        lastAttempt: now - 100,
      };
      (redis.get as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(attemptData))
        .mockResolvedValueOnce('1');
      (redis.ttl as jest.Mock).mockResolvedValue(1000);

      const stats = await detector.getAttemptStats(mockIP, mockEndpoint);
      expect(stats).toEqual({
        attempts: 2,
        firstAttempt: expect.any(Date),
        lastAttempt: expect.any(Date),
        blocked: true,
        blockTimeRemaining: 1000000,
      });
    });

    it('should handle no previous attempts', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.ttl as jest.Mock).mockResolvedValue(-1);

      const stats = await detector.getAttemptStats(mockIP, mockEndpoint);
      expect(stats.attempts).toBe(0);
      expect(stats.blocked).toBe(false);
      expect(stats.blockTimeRemaining).toBe(0);
    });
  });

  describe('resetAttempts', () => {
    it('should clear attempt counter', async () => {
      (redis.del as jest.Mock).mockResolvedValue(1);
      await detector.resetAttempts(mockIP, mockEndpoint);
      expect(redis.del).toHaveBeenCalledWith(
        expect.stringContaining('brute_force:')
      );
    });
  });

  describe('unblockIP', () => {
    it('should remove block and log event', async () => {
      (redis.del as jest.Mock).mockResolvedValue(1);
      await detector.unblockIP(mockIP);

      expect(redis.del).toHaveBeenCalledWith(
        expect.stringContaining('brute_force_block:')
      );

      const monitoringService = EnhancedMonitoringService.getInstance();
      expect(monitoringService.trackSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'brute_force_unblock',
          severity: 'medium',
          ipAddress: mockIP,
        })
      );
    });
  });
}); 
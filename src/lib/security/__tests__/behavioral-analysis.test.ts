import { BehavioralAnalysis } from '../behavioral-analysis';
import { EnhancedMonitoringService } from '@/lib/monitoring/service';
import type { ThreatEvent } from '../threat-detection';

// Mock dependencies
jest.mock('@/lib/redis');
jest.mock('@/lib/monitoring/service');

describe('BehavioralAnalysis', () => {
  let behavioralAnalysis: BehavioralAnalysis;
  let mockMonitoringService: jest.Mocked<typeof EnhancedMonitoringService>;

  const mockEvents: ThreatEvent[] = [
    {
      type: 'sql_injection',
      severity: 'high',
      timestamp: new Date(Date.now() - 1000),
      ipAddress: '1.2.3.4',
      requestId: 'req-1',
      details: {
        category: 'injection',
        description: 'SQL injection attempt',
        request: {
          method: 'POST',
          path: '/api/data',
          headers: { 'content-type': 'application/json' },
          body: '{"query": "SELECT * FROM users"}',
        },
      },
    },
    {
      type: 'xss',
      severity: 'medium',
      timestamp: new Date(Date.now() - 2000),
      ipAddress: '1.2.3.4',
      requestId: 'req-2',
      details: {
        category: 'xss',
        description: 'XSS attempt',
        request: {
          method: 'POST',
          path: '/api/data',
          headers: { 'content-type': 'application/json' },
          body: '{"content": "<script>alert(1)</script>"}',
        },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock monitoring service
    mockMonitoringService = {
      getInstance: jest.fn().mockReturnValue({
        trackSecurityEvent: jest.fn(),
      }),
    } as any;
    (EnhancedMonitoringService as jest.Mock) = mockMonitoringService;

    behavioralAnalysis = new BehavioralAnalysis();
  });

  describe('analyzeBehavior', () => {
    it('should analyze behavior for an IP address', async () => {
      const behavior = await behavioralAnalysis.analyzeBehavior(
        '1.2.3.4',
        mockEvents
      );

      expect(behavior).toMatchObject({
        ipAddress: '1.2.3.4',
        score: expect.any(Number),
        patterns: expect.any(Array),
        lastSeen: expect.any(Date),
        history: expect.arrayContaining([
          expect.objectContaining({
            timestamp: expect.any(Date),
            event: expect.any(Object),
            score: expect.any(Number),
          }),
        ]),
      });
    });

    it('should detect high request frequency', async () => {
      // Create many events in a short time window
      const highFrequencyEvents = Array.from({ length: 150 }, (_, i) => ({
        ...mockEvents[0],
        requestId: `req-${i}`,
        timestamp: new Date(Date.now() - i * 100),
      }));

      const behavior = await behavioralAnalysis.analyzeBehavior(
        '1.2.3.4',
        highFrequencyEvents
      );

      expect(behavior.patterns).toContain('request_frequency');
      expect(behavior.score).toBeGreaterThan(0.7);
    });

    it('should detect high error rates', async () => {
      const highErrorEvents = Array.from({ length: 10 }, (_, i) => ({
        ...mockEvents[0],
        requestId: `req-${i}`,
        severity: i < 4 ? 'critical' : 'low',
        timestamp: new Date(Date.now() - i * 1000),
      }));

      const behavior = await behavioralAnalysis.analyzeBehavior(
        '1.2.3.4',
        highErrorEvents
      );

      expect(behavior.patterns).toContain('error_rate');
      expect(behavior.score).toBeGreaterThan(0.5);
    });

    it('should detect pattern repetition', async () => {
      const repetitiveEvents = Array.from({ length: 10 }, (_, i) => ({
        ...mockEvents[0],
        requestId: `req-${i}`,
        timestamp: new Date(Date.now() - i * 1000),
      }));

      const behavior = await behavioralAnalysis.analyzeBehavior(
        '1.2.3.4',
        repetitiveEvents
      );

      expect(behavior.patterns).toContain('pattern_repetition');
      expect(behavior.score).toBeGreaterThan(0.5);
    });

    it('should detect unusual time distribution', async () => {
      // Create events with irregular intervals
      const irregularEvents = [
        { ...mockEvents[0], timestamp: new Date(Date.now() - 1000) },
        { ...mockEvents[0], timestamp: new Date(Date.now() - 5000) },
        { ...mockEvents[0], timestamp: new Date(Date.now() - 15000) },
        { ...mockEvents[0], timestamp: new Date(Date.now() - 16000) },
        { ...mockEvents[0], timestamp: new Date(Date.now() - 30000) },
      ];

      const behavior = await behavioralAnalysis.analyzeBehavior(
        '1.2.3.4',
        irregularEvents
      );

      expect(behavior.patterns).toContain('time_distribution');
      expect(behavior.score).toBeGreaterThan(0.5);
    });

    it('should update behavior score over time', async () => {
      // First analysis
      const behavior1 = await behavioralAnalysis.analyzeBehavior(
        '1.2.3.4',
        [mockEvents[0]]
      );

      // Second analysis with more events
      const behavior2 = await behavioralAnalysis.analyzeBehavior(
        '1.2.3.4',
        mockEvents
      );

      expect(behavior2.score).not.toBe(behavior1.score);
      expect(behavior2.history.length).toBeGreaterThan(behavior1.history.length);
    });

    it('should log significant behavior changes', async () => {
      // First analysis with low score
      await behavioralAnalysis.analyzeBehavior('1.2.3.4', [mockEvents[1]]);

      // Second analysis with high score
      const highScoreEvents = Array.from({ length: 150 }, (_, i) => ({
        ...mockEvents[0],
        requestId: `req-${i}`,
        timestamp: new Date(Date.now() - i * 100),
      }));

      await behavioralAnalysis.analyzeBehavior('1.2.3.4', highScoreEvents);

      expect(mockMonitoringService.getInstance().trackSecurityEvent)
        .toHaveBeenCalledWith(expect.objectContaining({
          type: 'suspicious_ip',
          severity: 'high',
          ipAddress: '1.2.3.4',
        }));
    });
  });

  describe('pattern management', () => {
    it('should update patterns', async () => {
      const newPatterns = [
        {
          type: 'custom_pattern',
          weight: 0.5,
          description: 'Custom behavior pattern',
          threshold: 10,
        },
      ];

      await behavioralAnalysis.updatePatterns(newPatterns);
      const behavior = await behavioralAnalysis.analyzeBehavior(
        '1.2.3.4',
        mockEvents
      );

      expect(mockMonitoringService.getInstance().trackSecurityEvent)
        .toHaveBeenCalledWith(expect.objectContaining({
          type: 'suspicious_ip',
          severity: 'low',
        }));
    });

    it('should clear cache', async () => {
      await behavioralAnalysis.analyzeBehavior('1.2.3.4', mockEvents);
      await behavioralAnalysis.clearCache();
      const behavior = await behavioralAnalysis.getBehavior('1.2.3.4');

      expect(behavior).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty event list', async () => {
      const behavior = await behavioralAnalysis.analyzeBehavior(
        '1.2.3.4',
        []
      );

      expect(behavior).toMatchObject({
        ipAddress: '1.2.3.4',
        score: 0,
        patterns: [],
        history: [],
      });
    });

    it('should handle events outside time window', async () => {
      const oldEvents = mockEvents.map(event => ({
        ...event,
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
      }));

      const behavior = await behavioralAnalysis.analyzeBehavior(
        '1.2.3.4',
        oldEvents,
        24 * 60 * 60 * 1000 // 24 hour window
      );

      expect(behavior.history).toHaveLength(0);
      expect(behavior.score).toBe(0);
    });

    it('should handle multiple IPs', async () => {
      const events = [
        { ...mockEvents[0], ipAddress: '1.2.3.4' },
        { ...mockEvents[1], ipAddress: '5.6.7.8' },
      ];

      const behavior1 = await behavioralAnalysis.analyzeBehavior(
        '1.2.3.4',
        events
      );
      const behavior2 = await behavioralAnalysis.analyzeBehavior(
        '5.6.7.8',
        events
      );

      expect(behavior1.ipAddress).toBe('1.2.3.4');
      expect(behavior2.ipAddress).toBe('5.6.7.8');
      expect(behavior1.history).not.toEqual(behavior2.history);
    });
  });
}); 
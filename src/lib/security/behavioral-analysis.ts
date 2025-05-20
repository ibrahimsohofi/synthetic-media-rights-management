import { redis } from '@/lib/redis';
import { EnhancedMonitoringService } from '@/lib/monitoring/service';
import type { ThreatEvent } from './threat-detection';

interface BehaviorPattern {
  type: string;
  weight: number;
  description: string;
  threshold: number;
}

interface IPBehavior {
  ipAddress: string;
  score: number;
  patterns: string[];
  lastSeen: Date;
  history: {
    timestamp: Date;
    event: ThreatEvent;
    score: number;
  }[];
}

const DEFAULT_PATTERNS: BehaviorPattern[] = [
  {
    type: 'request_frequency',
    weight: 0.3,
    description: 'Unusual request frequency patterns',
    threshold: 100, // requests per minute
  },
  {
    type: 'error_rate',
    weight: 0.2,
    description: 'High error rate in requests',
    threshold: 0.3, // 30% error rate
  },
  {
    type: 'pattern_repetition',
    weight: 0.25,
    description: 'Repeated suspicious patterns',
    threshold: 5, // occurrences
  },
  {
    type: 'time_distribution',
    weight: 0.15,
    description: 'Unusual time distribution of requests',
    threshold: 0.8, // similarity score
  },
  {
    type: 'resource_usage',
    weight: 0.1,
    description: 'Unusual resource usage patterns',
    threshold: 0.7, // normalized score
  },
];

export class BehavioralAnalysis {
  private patterns: BehaviorPattern[];
  private monitoringService: typeof EnhancedMonitoringService;
  private behaviorCache: Map<string, IPBehavior>;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor(patterns: BehaviorPattern[] = DEFAULT_PATTERNS) {
    this.patterns = patterns;
    this.monitoringService = EnhancedMonitoringService;
    this.behaviorCache = new Map();
  }

  async analyzeBehavior(
    ipAddress: string,
    events: ThreatEvent[],
    timeWindow: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<IPBehavior> {
    const now = Date.now();
    const recentEvents = events.filter(
      event => now - event.timestamp.getTime() < timeWindow
    );

    // Get or initialize behavior data
    let behavior = this.behaviorCache.get(ipAddress) || {
      ipAddress,
      score: 0,
      patterns: [],
      lastSeen: new Date(),
      history: [],
    };

    // Update behavior with new events
    for (const event of recentEvents) {
      const patternScores = await this.analyzePatterns(ipAddress, event, recentEvents);
      const eventScore = this.calculateEventScore(patternScores);
      
      behavior.history.push({
        timestamp: event.timestamp,
        event,
        score: eventScore,
      });

      // Update patterns
      const newPatterns = Object.entries(patternScores)
        .filter(([_, score]) => score > 0.7)
        .map(([pattern]) => pattern);
      
      behavior.patterns = [...new Set([...behavior.patterns, ...newPatterns])];
    }

    // Calculate overall behavior score
    behavior.score = this.calculateBehaviorScore(behavior);
    behavior.lastSeen = new Date();

    // Update cache
    this.behaviorCache.set(ipAddress, behavior);

    // Log significant changes
    await this.logBehaviorChanges(ipAddress, behavior);

    return behavior;
  }

  private async analyzePatterns(
    ipAddress: string,
    event: ThreatEvent,
    recentEvents: ThreatEvent[]
  ): Promise<Record<string, number>> {
    const scores: Record<string, number> = {};

    for (const pattern of this.patterns) {
      switch (pattern.type) {
        case 'request_frequency':
          scores[pattern.type] = this.analyzeRequestFrequency(ipAddress, recentEvents);
          break;
        case 'error_rate':
          scores[pattern.type] = this.analyzeErrorRate(recentEvents);
          break;
        case 'pattern_repetition':
          scores[pattern.type] = this.analyzePatternRepetition(event, recentEvents);
          break;
        case 'time_distribution':
          scores[pattern.type] = this.analyzeTimeDistribution(recentEvents);
          break;
        case 'resource_usage':
          scores[pattern.type] = this.analyzeResourceUsage(event);
          break;
      }
    }

    return scores;
  }

  private analyzeRequestFrequency(
    ipAddress: string,
    events: ThreatEvent[]
  ): number {
    const timeWindow = 60 * 1000; // 1 minute
    const now = Date.now();
    const recentCount = events.filter(
      event => now - event.timestamp.getTime() < timeWindow
    ).length;

    return Math.min(recentCount / this.patterns[0].threshold, 1);
  }

  private analyzeErrorRate(events: ThreatEvent[]): number {
    const errorEvents = events.filter(
      event => event.severity === 'high' || event.severity === 'critical'
    );
    return errorEvents.length / events.length;
  }

  private analyzePatternRepetition(
    event: ThreatEvent,
    events: ThreatEvent[]
  ): number {
    const similarEvents = events.filter(
      e => e.type === event.type && e.details.category === event.details.category
    );
    return Math.min(similarEvents.length / this.patterns[2].threshold, 1);
  }

  private analyzeTimeDistribution(events: ThreatEvent[]): number {
    if (events.length < 2) return 0;

    // Calculate time intervals between events
    const intervals = events
      .map(e => e.timestamp.getTime())
      .sort((a, b) => a - b)
      .slice(1)
      .map((time, i) => time - events[i].timestamp.getTime());

    // Calculate coefficient of variation
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    const cv = Math.sqrt(variance) / mean;

    // Normalize to 0-1 range (higher CV = more irregular)
    return Math.min(cv / 2, 1);
  }

  private analyzeResourceUsage(event: ThreatEvent): number {
    // Analyze resource usage based on event details
    const resourceScore = event.details.metrics
      ? (event.details.metrics.requestRate / 100) * 0.4 +
        (event.details.metrics.errorRate * 0.3) +
        (event.details.metrics.suspiciousScore / 100) * 0.3
      : 0;

    return Math.min(resourceScore, 1);
  }

  private calculateEventScore(patternScores: Record<string, number>): number {
    return this.patterns.reduce((score, pattern) => {
      return score + (patternScores[pattern.type] || 0) * pattern.weight;
    }, 0);
  }

  private calculateBehaviorScore(behavior: IPBehavior): number {
    if (behavior.history.length === 0) return 0;

    // Calculate weighted average of recent event scores
    const recentEvents = behavior.history.slice(-10); // Last 10 events
    const weights = recentEvents.map((_, i) => Math.pow(0.9, i)); // Exponential decay
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    return recentEvents.reduce((score, event, i) => {
      return score + (event.score * weights[i]) / totalWeight;
    }, 0);
  }

  private async logBehaviorChanges(
    ipAddress: string,
    behavior: IPBehavior
  ): Promise<void> {
    const monitoringService = this.monitoringService.getInstance();
    const previousBehavior = this.behaviorCache.get(ipAddress);

    if (previousBehavior && Math.abs(previousBehavior.score - behavior.score) > 0.2) {
      await monitoringService.trackSecurityEvent({
        type: 'behavior_change',
        severity: behavior.score > 0.7 ? 'high' : 'medium',
        ipAddress,
        timestamp: new Date(),
        details: {
          previousScore: previousBehavior.score,
          currentScore: behavior.score,
          newPatterns: behavior.patterns.filter(
            p => !previousBehavior.patterns.includes(p)
          ),
          description: 'Significant change in IP behavior detected',
        },
      });
    }
  }

  async getBehavior(ipAddress: string): Promise<IPBehavior | null> {
    return this.behaviorCache.get(ipAddress) || null;
  }

  async clearCache(): Promise<void> {
    this.behaviorCache.clear();
  }

  async updatePatterns(newPatterns: BehaviorPattern[]): Promise<void> {
    this.patterns = newPatterns;
    
    // Log pattern update
    const monitoringService = this.monitoringService.getInstance();
    await monitoringService.trackSecurityEvent({
      type: 'behavior_patterns_update',
      severity: 'low',
      timestamp: new Date(),
      details: {
        patterns: newPatterns.map(p => p.type),
        description: 'Behavioral analysis patterns updated',
      },
    });
  }
} 
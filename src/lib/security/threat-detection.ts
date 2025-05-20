import { redis } from '@/lib/redis';
import { EnhancedMonitoringService } from '@/lib/monitoring/service';
import { IPReputationTracker } from './ip-reputation';
import { GeoBlocking } from './geo-blocking';

export interface ThreatPattern {
  type: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  category: 'injection' | 'xss' | 'dos' | 'scanning' | 'malware' | 'other';
}

export interface ThreatConfig {
  patterns: ThreatPattern[];
  thresholds: {
    requestRate: number;
    errorRate: number;
    suspiciousScore: number;
    scanThreshold: number;
  };
  timeWindows: {
    short: number;
    medium: number;
    long: number;
  };
  actions: {
    block: boolean;
    alert: boolean;
    log: boolean;
  };
}

const DEFAULT_PATTERNS: ThreatPattern[] = [
  // SQL Injection
  {
    type: 'sql_injection',
    pattern: /(\b(select|insert|update|delete|drop|union|exec|where|from|into|values|set)\b.*\b(from|into|values|set|where)\b)|(\b(select|insert|update|delete|drop|union|exec)\b.*['"`].*['"`])/i,
    severity: 'high',
    description: 'Potential SQL injection attempt',
    category: 'injection',
  },
  // XSS
  {
    type: 'xss',
    pattern: /<script.*?>|javascript:|on\w+\s*=|data:(?:text|application)\/(?:javascript|ecmascript)/i,
    severity: 'high',
    description: 'Potential XSS attack attempt',
    category: 'xss',
  },
  // Path Traversal
  {
    type: 'path_traversal',
    pattern: /\.\.\/|\.\.\\|%2e%2e%2f|%252e%252e%252f/i,
    severity: 'medium',
    description: 'Potential path traversal attempt',
    category: 'injection',
  },
  // Command Injection
  {
    type: 'command_injection',
    pattern: /[;&|`$]|\b(cat|chmod|curl|wget|bash|sh|python|perl|ruby|php)\b/i,
    severity: 'high',
    description: 'Potential command injection attempt',
    category: 'injection',
  },
  // Port Scanning
  {
    type: 'port_scan',
    pattern: /(?:port\s*=\s*\d+|scan|nmap|masscan)/i,
    severity: 'medium',
    description: 'Potential port scanning attempt',
    category: 'scanning',
  },
  // Malware Patterns
  {
    type: 'malware',
    pattern: /(?:eval\(|base64_decode\(|gzinflate\(|str_rot13\(|preg_replace\(.*\/e)/i,
    severity: 'critical',
    description: 'Potential malware code',
    category: 'malware',
  },
];

const DEFAULT_CONFIG: ThreatConfig = {
  patterns: DEFAULT_PATTERNS,
  thresholds: {
    requestRate: 100, // requests per second
    errorRate: 0.1, // 10% error rate
    suspiciousScore: 70, // IP reputation score
    scanThreshold: 50, // requests per minute for scan detection
  },
  timeWindows: {
    short: 60 * 1000, // 1 minute
    medium: 5 * 60 * 1000, // 5 minutes
    long: 15 * 60 * 1000, // 15 minutes
  },
  actions: {
    block: true,
    alert: true,
    log: true,
  },
};

export interface ThreatEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  ipAddress: string;
  requestId: string;
  details: {
    pattern?: string;
    category?: string;
    description: string;
    request?: {
      method: string;
      path: string;
      headers: Record<string, string>;
      body?: string;
    };
    metrics?: {
      requestRate: number;
      errorRate: number;
      suspiciousScore: number;
    };
  };
}

export class ThreatDetection {
  private config: ThreatConfig;
  private monitoringService: typeof EnhancedMonitoringService;
  private ipReputation: IPReputationTracker;
  private geoBlocking: GeoBlocking;
  private requestCounts: Map<string, number[]>;
  private errorCounts: Map<string, number[]>;

  constructor(
    config: Partial<ThreatConfig> = {},
    ipReputation: IPReputationTracker,
    geoBlocking: GeoBlocking
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.monitoringService = EnhancedMonitoringService;
    this.ipReputation = ipReputation;
    this.geoBlocking = geoBlocking;
    this.requestCounts = new Map();
    this.errorCounts = new Map();
  }

  async analyzeRequest(
    ipAddress: string,
    requestId: string,
    request: {
      method: string;
      path: string;
      headers: Record<string, string>;
      body?: string;
    }
  ): Promise<ThreatEvent[]> {
    const threats: ThreatEvent[] = [];

    // Update request counts
    this.updateRequestCount(ipAddress);

    // Check for pattern-based threats
    const patternThreats = await this.checkPatterns(ipAddress, requestId, request);
    threats.push(...patternThreats);

    // Check for rate-based threats
    const rateThreats = await this.checkRates(ipAddress, requestId);
    threats.push(...rateThreats);

    // Check IP reputation
    const reputationThreats = await this.checkReputation(ipAddress, requestId);
    threats.push(...reputationThreats);

    // Check geographic blocking
    const geoThreats = await this.checkGeoBlocking(ipAddress, requestId);
    threats.push(...geoThreats);

    // Take actions based on threats
    await this.handleThreats(threats);

    return threats;
  }

  private async checkPatterns(
    ipAddress: string,
    requestId: string,
    request: {
      method: string;
      path: string;
      headers: Record<string, string>;
      body?: string;
    }
  ): Promise<ThreatEvent[]> {
    const threats: ThreatEvent[] = [];
    const content = `${request.method} ${request.path} ${JSON.stringify(request.headers)} ${request.body || ''}`;

    for (const pattern of this.config.patterns) {
      if (pattern.pattern.test(content)) {
        threats.push({
          type: pattern.type,
          severity: pattern.severity,
          timestamp: new Date(),
          ipAddress,
          requestId,
          details: {
            pattern: pattern.pattern.toString(),
            category: pattern.category,
            description: pattern.description,
            request,
          },
        });
      }
    }

    return threats;
  }

  private async checkRates(ipAddress: string, requestId: string): Promise<ThreatEvent[]> {
    const threats: ThreatEvent[] = [];
    const now = Date.now();

    // Get request counts for different time windows
    const shortWindowCount = this.getRequestCount(ipAddress, this.config.timeWindows.short);
    const mediumWindowCount = this.getRequestCount(ipAddress, this.config.timeWindows.medium);
    const errorCount = this.getErrorCount(ipAddress, this.config.timeWindows.medium);

    // Check request rate
    const requestRate = shortWindowCount / (this.config.timeWindows.short / 1000);
    if (requestRate > this.config.thresholds.requestRate) {
      threats.push({
        type: 'high_request_rate',
        severity: 'medium',
        timestamp: new Date(),
        ipAddress,
        requestId,
        details: {
          description: 'Request rate exceeds threshold',
          metrics: {
            requestRate,
            errorRate: 0,
            suspiciousScore: 0,
          },
        },
      });
    }

    // Check error rate
    const errorRate = errorCount / mediumWindowCount;
    if (errorRate > this.config.thresholds.errorRate) {
      threats.push({
        type: 'high_error_rate',
        severity: 'medium',
        timestamp: new Date(),
        ipAddress,
        requestId,
        details: {
          description: 'Error rate exceeds threshold',
          metrics: {
            requestRate,
            errorRate,
            suspiciousScore: 0,
          },
        },
      });
    }

    // Check for scanning behavior
    if (mediumWindowCount > this.config.thresholds.scanThreshold) {
      threats.push({
        type: 'potential_scan',
        severity: 'low',
        timestamp: new Date(),
        ipAddress,
        requestId,
        details: {
          description: 'Potential scanning behavior detected',
          metrics: {
            requestRate,
            errorRate,
            suspiciousScore: 0,
          },
        },
      });
    }

    return threats;
  }

  private async checkReputation(ipAddress: string, requestId: string): Promise<ThreatEvent[]> {
    const threats: ThreatEvent[] = [];
    const reputation = await this.ipReputation.getReputation(ipAddress);

    if (reputation.score > this.config.thresholds.suspiciousScore) {
      threats.push({
        type: 'suspicious_ip',
        severity: 'high',
        timestamp: new Date(),
        ipAddress,
        requestId,
        details: {
          description: 'IP has high suspicious score',
          metrics: {
            requestRate: 0,
            errorRate: 0,
            suspiciousScore: reputation.score,
          },
        },
      });
    }

    return threats;
  }

  private async checkGeoBlocking(ipAddress: string, requestId: string): Promise<ThreatEvent[]> {
    const threats: ThreatEvent[] = [];
    const isBlocked = await this.geoBlocking.isBlocked(ipAddress);

    if (isBlocked) {
      threats.push({
        type: 'geo_blocked',
        severity: 'medium',
        timestamp: new Date(),
        ipAddress,
        requestId,
        details: {
          description: 'IP is blocked by geographic policy',
        },
      });
    }

    return threats;
  }

  private async handleThreats(threats: ThreatEvent[]): Promise<void> {
    const monitoringService = this.monitoringService.getInstance();

    for (const threat of threats) {
      // Log threat
      if (this.config.actions.log) {
        await monitoringService.trackSecurityEvent({
          type: threat.type,
          severity: threat.severity,
          ipAddress: threat.ipAddress,
          timestamp: threat.timestamp,
          details: threat.details,
        });
      }

      // Update IP reputation
      await this.ipReputation.updateReputation(threat.ipAddress, {
        type: threat.type,
        severity: threat.severity,
        timestamp: threat.timestamp,
        details: threat.details,
      });

      // Block IP if configured and threat is severe enough
      if (this.config.actions.block && (threat.severity === 'high' || threat.severity === 'critical')) {
        // Implementation would depend on your blocking mechanism
        // This could involve updating firewall rules, rate limiting, etc.
      }

      // Send alert if configured
      if (this.config.actions.alert && (threat.severity === 'high' || threat.severity === 'critical')) {
        // Implementation would depend on your alerting system
        // This could involve sending emails, Slack messages, etc.
      }
    }
  }

  private updateRequestCount(ipAddress: string): void {
    const now = Date.now();
    const counts = this.requestCounts.get(ipAddress) || [];
    counts.push(now);
    this.requestCounts.set(ipAddress, counts);
  }

  private updateErrorCount(ipAddress: string): void {
    const now = Date.now();
    const counts = this.errorCounts.get(ipAddress) || [];
    counts.push(now);
    this.errorCounts.set(ipAddress, counts);
  }

  private getRequestCount(ipAddress: string, windowMs: number): number {
    const now = Date.now();
    const counts = this.requestCounts.get(ipAddress) || [];
    return counts.filter(timestamp => now - timestamp < windowMs).length;
  }

  private getErrorCount(ipAddress: string, windowMs: number): number {
    const now = Date.now();
    const counts = this.errorCounts.get(ipAddress) || [];
    return counts.filter(timestamp => now - timestamp < windowMs).length;
  }

  async updateConfig(newConfig: Partial<ThreatConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    // Log config update
    const monitoringService = this.monitoringService.getInstance();
    await monitoringService.trackSecurityEvent({
      type: 'threat_detection_config_update',
      severity: 'low',
      timestamp: new Date(),
      details: {
        oldConfig: this.config,
        newConfig,
      },
    });
  }

  async getConfig(): Promise<ThreatConfig> {
    return { ...this.config };
  }

  async clearCounts(): Promise<void> {
    this.requestCounts.clear();
    this.errorCounts.clear();
  }
} 
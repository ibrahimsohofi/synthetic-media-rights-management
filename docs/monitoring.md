# Monitoring System Documentation

## Overview

The monitoring system provides comprehensive monitoring, security, and visualization capabilities for your application. It includes real-time metrics tracking, security event monitoring, and advanced visualization components.

## Components

### Enhanced Monitoring Service

The core monitoring service that collects and processes metrics from various sources:

- System metrics (CPU, memory, disk, network)
- Application metrics (request rates, response times, error rates)
- Security events (threats, attacks, suspicious activities)
- Custom metrics

### Security Monitoring

#### Advanced Threat Detection

- Pattern-based threat detection
  - SQL injection detection
  - XSS attack detection
  - Path traversal detection
  - Command injection detection
  - Port scanning detection
  - Malware pattern detection
- Rate-based threat detection
  - Request rate monitoring
  - Error rate monitoring
  - Scanning behavior detection
- IP reputation integration
- Geographic blocking integration
- Configurable threat patterns and thresholds
- Automated threat response
- Comprehensive event logging

#### Behavioral Analysis

- Advanced behavioral pattern detection
  - Request frequency analysis
  - Error rate analysis
  - Pattern repetition detection
  - Time distribution analysis
  - Resource usage monitoring
- Weighted scoring system
- Pattern-based threat detection
- Historical behavior tracking
- Real-time behavior updates
- Configurable behavior patterns
- Automated alerts for significant changes

#### IP Reputation Tracking

- Dynamic reputation scoring based on behavior
- Score decay over time
- Event-based score adjustments
- Suspicious IP detection
- Integration with security events

#### Geographic IP Blocking

- Country-based access control
- Configurable blocked/allowed countries
- Unknown location handling
- Location caching with configurable update interval
- Integration with MaxMind GeoIP2 (optional)
- Fallback to ipapi.co for location lookups
- Comprehensive event logging

#### Brute Force Protection

- Configurable attempt limits
- Time-based blocking
- Endpoint-specific protection
- Automatic unblocking
- Attempt statistics tracking
- Integration with monitoring service

### Dashboard UI

#### Security Tab

- Threat timeline visualization
- Threat type distribution
- Severity distribution
- IP reputation scores
- Suspicious IP lists
- Geographic blocking status
- Recent high severity threats

#### Threat Analysis Tab

- Comprehensive threat visualization
  - Threat timeline by severity
  - Category distribution
  - Behavioral analysis
  - Pattern detection
- Real-time threat monitoring
- Interactive charts and graphs
- Detailed threat metrics
- Historical threat data
- Pattern-based analysis
- Severity-based filtering

#### Geographic Distribution Tab

- Regional traffic analysis
- Country-level statistics
- Event distribution by region
- Block distribution by reason
- Coverage metrics
- Security event mapping
- Interactive geographic visualizations

#### Network Analysis Tab

- Traffic analysis (inbound/outbound)
- Protocol distribution
- Regional traffic distribution
- Performance metrics
- Error rate tracking
- Latency monitoring
- Active connections

#### API Metrics Tab

- Response time trends
- Status code distribution
- HTTP method usage
- Endpoint performance
- Error rate analysis
- Request volume tracking

## Configuration

### Environment Variables

```env
# Monitoring Service
MONITORING_ENABLED=true
METRICS_INTERVAL=60000
RETENTION_PERIOD=604800000

# Security
SECURITY_ENABLED=true
THREAT_DETECTION_ENABLED=true
RATE_LIMIT_ENABLED=true

# Threat Detection
THREAT_DETECTION_PATTERNS_ENABLED=true
THREAT_DETECTION_RATE_LIMIT=100
THREAT_DETECTION_ERROR_RATE=0.1
THREAT_DETECTION_SUSPICIOUS_SCORE=70
THREAT_DETECTION_SCAN_THRESHOLD=50

# Behavioral Analysis
BEHAVIORAL_ANALYSIS_ENABLED=true
BEHAVIORAL_ANALYSIS_WINDOW=86400000
BEHAVIORAL_ANALYSIS_THRESHOLD=0.7
BEHAVIORAL_ANALYSIS_CACHE_TTL=86400000

# IP Reputation
IP_REPUTATION_ENABLED=true
REPUTATION_SCORE_THRESHOLD=50
REPUTATION_DECAY_RATE=0.1
REPUTATION_UPDATE_INTERVAL=3600000

# Geographic Blocking
GEO_BLOCKING_ENABLED=true
GEO_BLOCK_UNKNOWN=true
GEO_UPDATE_INTERVAL=86400000
MAXMIND_LICENSE_KEY=your_license_key

# Brute Force Protection
BRUTE_FORCE_ENABLED=true
BRUTE_FORCE_MAX_ATTEMPTS=5
BRUTE_FORCE_WINDOW_MS=900000
BRUTE_FORCE_BLOCK_DURATION_MS=3600000
```

### Security Configuration

#### Threat Detection Configuration

```typescript
interface ThreatConfig {
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

interface ThreatPattern {
  type: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  category: 'injection' | 'xss' | 'dos' | 'scanning' | 'malware' | 'other';
}
```

#### Behavioral Analysis Configuration

```typescript
interface BehaviorPattern {
  type: string;
  weight: number;
  description: string;
  threshold: number;
}

interface BehavioralAnalysisConfig {
  patterns: BehaviorPattern[];
  timeWindow: number;
  scoreThreshold: number;
  cacheTTL: number;
  actions: {
    alert: boolean;
    block: boolean;
    log: boolean;
  };
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
```

#### IP Reputation Configuration

```typescript
interface IPReputationConfig {
  scoreThreshold: number;
  decayRate: number;
  maxScore: number;
  minScore: number;
  updateInterval: number;
}
```

#### Geographic Blocking Configuration

```typescript
interface GeoBlockingConfig {
  blockedCountries: string[];
  allowedCountries: string[];
  blockUnknownLocations: boolean;
  updateInterval: number;
  maxmindLicenseKey?: string;
}
```

#### Brute Force Configuration

```typescript
interface BruteForceConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  endpoints: string[];
}
```

## Usage

### Basic Monitoring

```typescript
import { EnhancedMonitoringService } from '@/lib/monitoring/service';

const monitoringService = EnhancedMonitoringService.getInstance();

// Track custom metric
await monitoringService.trackMetric('custom_metric', {
  value: 42,
  tags: { category: 'example' },
});

// Track security event
await monitoringService.trackSecurityEvent({
  type: 'suspicious_ip',
  severity: 'high',
  ipAddress: '1.2.3.4',
  timestamp: new Date(),
  details: {
    reason: 'multiple_failures',
    attempts: 10,
  },
});
```

### Threat Detection

```typescript
import { ThreatDetection } from '@/lib/security/threat-detection';
import { IPReputationTracker } from '@/lib/security/ip-reputation';
import { GeoBlocking } from '@/lib/security/geo-blocking';

const ipReputation = new IPReputationTracker();
const geoBlocking = new GeoBlocking();
const threatDetection = new ThreatDetection(
  {
    patterns: [
      {
        type: 'custom_pattern',
        pattern: /custom-regex/,
        severity: 'high',
        description: 'Custom threat pattern',
        category: 'other',
      },
    ],
    thresholds: {
      requestRate: 150,
      errorRate: 0.15,
      suspiciousScore: 80,
      scanThreshold: 75,
    },
  },
  ipReputation,
  geoBlocking
);

// Analyze request for threats
const threats = await threatDetection.analyzeRequest('1.2.3.4', 'req-123', {
  method: 'POST',
  path: '/api/data',
  headers: {
    'content-type': 'application/json',
  },
  body: '{"query": "test"}',
});

// Update configuration
await threatDetection.updateConfig({
  thresholds: {
    requestRate: 200,
  },
});
```

### Behavioral Analysis

```typescript
import { BehavioralAnalysis } from '@/lib/security/behavioral-analysis';

const behavioralAnalysis = new BehavioralAnalysis();

// Analyze IP behavior
const behavior = await behavioralAnalysis.analyzeBehavior(
  '1.2.3.4',
  threatEvents,
  24 * 60 * 60 * 1000 // 24 hour window
);

// Update behavior patterns
await behavioralAnalysis.updatePatterns([
  {
    type: 'custom_pattern',
    weight: 0.5,
    description: 'Custom behavior pattern',
    threshold: 10,
  },
]);

// Get behavior for an IP
const ipBehavior = await behavioralAnalysis.getBehavior('1.2.3.4');

// Clear behavior cache
await behavioralAnalysis.clearCache();
```

### Threat Analysis Visualization

```typescript
import { ThreatAnalysis } from '@/components/dashboard/threat-analysis';

// In your React component
function Dashboard() {
  const [events, setEvents] = useState<ThreatEvent[]>([]);
  const [behavioralData, setBehavioralData] = useState<IPBehavior[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  return (
    <div>
      <ThreatAnalysis
        events={events}
        behavioralData={behavioralData}
        timeRange={timeRange}
      />
    </div>
  );
}
```

### Geographic Distribution

```typescript
import { GeoDistribution } from '@/components/dashboard/geo-distribution';

// In your React component
function Dashboard() {
  const [locations, setLocations] = useState<Map<string, GeoLocation>>(new Map());
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  return (
    <div>
      <GeoDistribution
        locations={locations}
        events={events}
        timeRange={timeRange}
      />
    </div>
  );
}
```

### Geographic IP Blocking

```typescript
import { GeoBlocking } from '@/lib/security/geo-blocking';

const geoBlocking = new GeoBlocking({
  blockedCountries: ['CN', 'RU'],
  allowedCountries: ['US', 'CA', 'GB'],
  blockUnknownLocations: true,
  updateInterval: 24 * 60 * 60 * 1000, // 24 hours
});

// Check if IP should be blocked
const isBlocked = await geoBlocking.isBlocked('1.2.3.4');
if (isBlocked) {
  // Handle blocked access
}

// Update configuration
await geoBlocking.updateConfig({
  blockedCountries: ['CN', 'RU', 'IR'],
});

// Get current blocked countries
const blockedCountries = await geoBlocking.getBlockedCountries();

// Clear location cache
await geoBlocking.clearLocationCache();
```

## Testing

### Security Testing

#### Threat Detection Tests

- Pattern-based detection
  - SQL injection detection
  - XSS attack detection
  - Path traversal detection
  - Command injection detection
  - Port scanning detection
  - Malware pattern detection
- Rate-based detection
  - Request rate monitoring
  - Error rate monitoring
  - Scanning behavior detection
- IP reputation integration
- Geographic blocking integration
- Configuration management
- Threat handling

#### Behavioral Analysis Tests

- Pattern detection
  - Request frequency analysis
  - Error rate analysis
  - Pattern repetition detection
  - Time distribution analysis
  - Resource usage monitoring
- Score calculation
- Pattern updates
- Cache management
- Edge cases
- Multiple IP handling

#### Geographic IP Blocking Tests

- Country-based blocking
- Allowed countries list
- Unknown location handling
- Location caching
- Configuration updates
- Cache management

#### IP Reputation Tests

- Score initialization
- Score updates
- Score decay
- Event tracking
- Suspicious IP detection

#### Brute Force Protection Tests

- Attempt tracking
- IP blocking
- Automatic unblocking
- Configuration updates
- Edge cases

### Component Testing

#### Threat Analysis Component

- Timeline visualization
- Category distribution
- Behavioral analysis
- Data processing
- Responsive design
- Time range selection
- Pattern detection
- Severity filtering

#### Geographic Distribution Component

- Regional visualization
- Country-level statistics
- Event distribution
- Block distribution
- Coverage metrics
- Data processing
- Responsive design

#### Network Analysis Component

- Traffic visualization
- Protocol distribution
- Regional traffic
- Performance metrics
- Error handling
- Data processing
- Responsive design

## Best Practices

### Security

1. **Threat Detection**
   - Regularly update threat patterns
   - Monitor detection rates
   - Adjust thresholds based on traffic
   - Review and update patterns
   - Implement proper logging
   - Regular analysis of detected threats

2. **Behavioral Analysis**
   - Monitor pattern effectiveness
   - Adjust pattern weights
   - Review detection thresholds
   - Analyze false positives
   - Update patterns regularly
   - Monitor behavior changes

3. **Geographic Blocking**
   - Regularly update blocked/allowed countries
   - Monitor blocked access attempts
   - Use MaxMind GeoIP2 for accurate location data
   - Implement proper error handling for location lookups
   - Cache locations to reduce API calls

4. **IP Reputation**
   - Adjust score thresholds based on traffic patterns
   - Monitor reputation score distributions
   - Review and adjust decay rates
   - Implement proper logging for score changes
   - Regular cleanup of old reputation data

5. **Brute Force Protection**
   - Set appropriate attempt limits
   - Monitor blocked IPs
   - Implement proper logging
   - Regular review of blocked IPs
   - Adjust time windows based on traffic patterns

### Monitoring

1. **Threat Analysis**
   - Monitor threat patterns
   - Track category distribution
   - Analyze behavioral trends
   - Review detection effectiveness
   - Set up alerts for anomalies
   - Regular review of patterns

2. **Geographic Distribution**
   - Monitor regional patterns
   - Track country-level statistics
   - Analyze event distribution
   - Review block reasons
   - Set up alerts for anomalies
   - Regular review of coverage

3. **Network Analysis**
   - Monitor traffic patterns
   - Track protocol usage
   - Analyze regional distribution
   - Set up alerts for anomalies
   - Regular review of performance metrics

4. **Dashboard Usage**
   - Use appropriate time ranges
   - Monitor key metrics
   - Set up alerts for critical events
   - Regular review of security events
   - Customize views based on needs

## Troubleshooting

### Threat Detection

1. **False Positives**
   - Review threat patterns
   - Adjust thresholds
   - Check request patterns
   - Monitor detection rates
   - Update pattern definitions

2. **Missed Threats**
   - Review detection logs
   - Update threat patterns
   - Check threshold settings
   - Monitor detection coverage
   - Analyze missed patterns

### Behavioral Analysis

1. **Pattern Detection**
   - Review pattern weights
   - Check detection thresholds
   - Analyze pattern effectiveness
   - Monitor false positives
   - Update pattern definitions

2. **Score Calculation**
   - Review score thresholds
   - Check weight distribution
   - Analyze score trends
   - Monitor score changes
   - Adjust calculation parameters

### Geographic Blocking

1. **Location Lookup Failures**
   - Check API key validity
   - Verify network connectivity
   - Review API rate limits
   - Check cache configuration
   - Monitor error logs

2. **Unexpected Blocks**
   - Review blocked countries list
   - Check allowed countries list
   - Verify location data accuracy
   - Review blocked access logs
   - Check configuration updates

### Network Analysis

1. **Missing Data**
   - Verify metrics collection
   - Check data processing
   - Review time range selection
   - Monitor API endpoints
   - Check component rendering

2. **Performance Issues**
   - Review data processing
   - Check component updates
   - Monitor memory usage
   - Verify cache configuration
   - Check API response times

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Add tests
5. Update documentation
6. Submit pull request

## License

MIT License - see LICENSE file for details 
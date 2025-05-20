export interface APIMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  requestSize?: number;
  responseSize?: number;
  cacheStatus?: 'hit' | 'miss' | 'bypass';
  databaseQueries?: number;
  databaseQueryTime?: number;
  memoryUsage?: number;
}

export interface ErrorLog {
  error: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  requestBody?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'api' | 'database' | 'redis' | 'security' | 'system';
  context?: Record<string, unknown>;
}

export interface SecurityEvent {
  type: 'rate_limit' | 'auth_failure' | 'suspicious_ip' | 'sql_injection' | 'xss_attempt';
  timestamp: Date;
  ipAddress: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertConfig {
  id: string;
  name: string;
  type: 'error_rate' | 'response_time' | 'security' | 'system';
  condition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    window: number; // in seconds
  };
  channels: ('email' | 'slack' | 'webhook')[];
  recipients: string[];
  cooldown: number; // in seconds
  enabled: boolean;
}

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
}

export interface MonitoringConfig {
  metricsRetentionDays: number;
  errorRetentionDays: number;
  alertThresholds: {
    errorRate: number;
    responseTime: number;
    cpuUsage: number;
    memoryUsage: number;
  };
  samplingRate: number;
  enabledFeatures: {
    detailedMetrics: boolean;
    securityMonitoring: boolean;
    systemMetrics: boolean;
    alerting: boolean;
  };
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
  userId?: string;
  sessionId?: string;
} 
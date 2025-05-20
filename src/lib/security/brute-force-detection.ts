import { redis } from '@/lib/redis';
import { EnhancedMonitoringService } from '../monitoring/service';
import type { SecurityEvent } from '../monitoring/types';

interface BruteForceConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  endpoints: string[];
}

const DEFAULT_CONFIG: BruteForceConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 60 * 60 * 1000, // 1 hour
  endpoints: ['/api/auth/login', '/api/auth/reset-password'],
};

export class BruteForceDetector {
  private config: BruteForceConfig;
  private monitoringService: EnhancedMonitoringService;

  constructor(config: Partial<BruteForceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.monitoringService = EnhancedMonitoringService.getInstance();
  }

  private getKey(ipAddress: string, endpoint: string): string {
    return `brute_force:${endpoint}:${ipAddress}`;
  }

  private getBlockKey(ipAddress: string): string {
    return `brute_force_block:${ipAddress}`;
  }

  async isBlocked(ipAddress: string): Promise<boolean> {
    const blockKey = this.getBlockKey(ipAddress);
    const blockData = await redis.get(blockKey);
    return !!blockData;
  }

  async getBlockTimeRemaining(ipAddress: string): Promise<number> {
    const blockKey = this.getBlockKey(ipAddress);
    const ttl = await redis.ttl(blockKey);
    return Math.max(0, ttl * 1000); // Convert to milliseconds
  }

  async trackAttempt(
    ipAddress: string,
    endpoint: string,
    success: boolean
  ): Promise<{ blocked: boolean; attemptsRemaining: number }> {
    if (!this.config.endpoints.includes(endpoint)) {
      return { blocked: false, attemptsRemaining: this.config.maxAttempts };
    }

    // Check if IP is already blocked
    if (await this.isBlocked(ipAddress)) {
      return { blocked: true, attemptsRemaining: 0 };
    }

    const key = this.getKey(ipAddress, endpoint);
    const now = Date.now();

    // Get current attempts
    const attempts = await redis.get(key);
    const attemptData = attempts ? JSON.parse(attempts) : { count: 0, firstAttempt: now };

    // Update attempt count
    attemptData.count++;
    attemptData.lastAttempt = now;

    // Store updated attempts
    await redis.set(key, JSON.stringify(attemptData), 'PX', this.config.windowMs);

    // Check if we should block
    if (attemptData.count >= this.config.maxAttempts) {
      await this.blockIP(ipAddress, endpoint, attemptData);
      return { blocked: true, attemptsRemaining: 0 };
    }

    // If attempt was successful, reset the counter
    if (success) {
      await redis.del(key);
      return { blocked: false, attemptsRemaining: this.config.maxAttempts };
    }

    return {
      blocked: false,
      attemptsRemaining: this.config.maxAttempts - attemptData.count,
    };
  }

  private async blockIP(
    ipAddress: string,
    endpoint: string,
    attemptData: { count: number; firstAttempt: number; lastAttempt: number }
  ): Promise<void> {
    const blockKey = this.getBlockKey(ipAddress);
    await redis.set(blockKey, '1', 'PX', this.config.blockDurationMs);

    // Log security event
    await this.monitoringService.trackSecurityEvent({
      type: 'brute_force_attempt',
      severity: 'high',
      ipAddress,
      endpoint,
      timestamp: new Date(),
      details: {
        attempts: attemptData.count,
        timeWindow: this.config.windowMs,
        firstAttempt: new Date(attemptData.firstAttempt).toISOString(),
        lastAttempt: new Date(attemptData.lastAttempt).toISOString(),
        blockDuration: this.config.blockDurationMs,
      },
    });
  }

  async getAttemptStats(ipAddress: string, endpoint: string): Promise<{
    attempts: number;
    firstAttempt: Date;
    lastAttempt: Date;
    blocked: boolean;
    blockTimeRemaining: number;
  }> {
    const key = this.getKey(ipAddress, endpoint);
    const blockKey = this.getBlockKey(ipAddress);
    const attempts = await redis.get(key);
    const blockData = await redis.get(blockKey);
    const ttl = await redis.ttl(blockKey);

    const attemptData = attempts ? JSON.parse(attempts) : { count: 0, firstAttempt: Date.now(), lastAttempt: Date.now() };

    return {
      attempts: attemptData.count,
      firstAttempt: new Date(attemptData.firstAttempt),
      lastAttempt: new Date(attemptData.lastAttempt),
      blocked: !!blockData,
      blockTimeRemaining: Math.max(0, ttl * 1000),
    };
  }

  async resetAttempts(ipAddress: string, endpoint: string): Promise<void> {
    const key = this.getKey(ipAddress, endpoint);
    await redis.del(key);
  }

  async unblockIP(ipAddress: string): Promise<void> {
    const blockKey = this.getBlockKey(ipAddress);
    await redis.del(blockKey);

    // Log unblock event
    await this.monitoringService.trackSecurityEvent({
      type: 'brute_force_unblock',
      severity: 'medium',
      ipAddress,
      timestamp: new Date(),
      details: {
        action: 'manual_unblock',
      },
    });
  }
} 
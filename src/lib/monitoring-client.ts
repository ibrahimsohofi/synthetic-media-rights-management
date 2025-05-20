/**
 * Client-side monitoring utilities that are Edge-compatible
 * This file is used in client components and middleware
 */

import { Redis } from '@upstash/redis';

// Check if we're in Edge runtime
const isEdge = typeof EdgeRuntime !== 'undefined';

// Initialize Redis client that works in Edge
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export interface ClientMetric {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
}

export interface ClientError {
  message: string;
  source: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, string>;
}

export const clientMonitoring = {
  /**
   * Record a client-side metric
   */
  async recordMetric(metric: ClientMetric): Promise<void> {
    try {
      const key = `client:metrics:${metric.name}`;
      await redis.lpush(key, JSON.stringify(metric));
      await redis.ltrim(key, 0, 99); // Keep last 100 metrics
    } catch (error) {
      console.error('Failed to record client metric:', error);
    }
  },

  /**
   * Record a client-side error
   */
  async recordError(error: ClientError): Promise<void> {
    try {
      const key = 'client:errors';
      await redis.lpush(key, JSON.stringify(error));
      await redis.ltrim(key, 0, 99); // Keep last 100 errors
    } catch (err) {
      console.error('Failed to record client error:', err);
    }
  },

  /**
   * Get client metrics by name
   */
  async getMetrics(name: string, limit: number = 50): Promise<ClientMetric[]> {
    try {
      const key = `client:metrics:${name}`;
      const metrics = await redis.lrange(key, 0, limit - 1);
      return metrics.map(m => JSON.parse(m as string));
    } catch (error) {
      console.error('Failed to get client metrics:', error);
      return [];
    }
  },

  /**
   * Get recent client errors
   */
  async getErrors(limit: number = 50): Promise<ClientError[]> {
    try {
      const key = 'client:errors';
      const errors = await redis.lrange(key, 0, limit - 1);
      return errors.map(e => JSON.parse(e as string));
    } catch (error) {
      console.error('Failed to get client errors:', error);
      return [];
    }
  }
}; 
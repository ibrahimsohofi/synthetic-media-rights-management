/**
 * Edge-compatible Redis client
 */
import { Redis } from '@upstash/redis';

// Edge-compatible Redis client
export const edgeRedis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Simple wrapper for common operations
export const edgeCache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      return await edgeRedis.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },
  
  async set(key: string, value: any, expireInSeconds?: number): Promise<void> {
    try {
      if (expireInSeconds) {
        await edgeRedis.set(key, value, { ex: expireInSeconds });
      } else {
        await edgeRedis.set(key, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  },
  
  async del(key: string): Promise<void> {
    try {
      await edgeRedis.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }
}; 
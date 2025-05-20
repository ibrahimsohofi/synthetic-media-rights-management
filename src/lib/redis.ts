import { Redis as RedisClient } from '@upstash/redis';

// Determine if we're running in Edge runtime
const isEdge = typeof EdgeRuntime !== 'undefined';

// Create the appropriate Redis client based on environment
export const redis = isEdge
  ? new RedisClient({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
  : new RedisClient({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || 'redis://localhost:6379',
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

// Log any Redis errors
if (!isEdge) {
  console.log('Using Node.js Redis client');
} else {
  console.log('Using Edge-compatible Redis client');
} 
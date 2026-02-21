import Redis from 'ioredis';
import { AppError } from '@/middleware/errorHandler';

export class RedisService {
  private static instance: RedisService;
  private client: Redis;
  private subscriber: Redis;

  private constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    });

    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
    });

    this.subscriber.on('error', (error) => {
      console.error('Redis subscriber error:', error);
    });

    this.client.on('connect', () => {
      console.log('✅ Redis client connected');
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  // Get Redis client
  public getClient(): Redis {
    return this.client;
  }

  // Get Redis subscriber
  public getSubscriber(): Redis {
    return this.subscriber;
  }

  // Set value
  public async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    try {
      if (expireSeconds) {
        await this.client.setex(key, expireSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
      throw new AppError('Failed to set cache', 500);
    }
  }

  // Get value
  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      throw new AppError('Failed to get cache', 500);
    }
  }

  // Delete value
  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
      throw new AppError('Failed to delete cache', 500);
    }
  }

  // Increment value
  public async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error('Redis incr error:', error);
      throw new AppError('Failed to increment counter', 500);
    }
  }

  // Set expiration
  public async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      console.error('Redis expire error:', error);
      throw new AppError('Failed to set expiration', 500);
    }
  }

  // Check if key exists
  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      throw new AppError('Failed to check key existence', 500);
    }
  }

  // Get multiple values
  public async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.client.mget(keys);
    } catch (error) {
      console.error('Redis mget error:', error);
      throw new AppError('Failed to get multiple values', 500);
    }
  }

  // Set multiple values
  public async mset(keyValues: Record<string, string>): Promise<void> {
    try {
      const args: string[] = [];
      for (const [key, value] of Object.entries(keyValues)) {
        args.push(key, value);
      }
      await this.client.mset(args);
    } catch (error) {
      console.error('Redis mset error:', error);
      throw new AppError('Failed to set multiple values', 500);
    }
  }

  // Get all keys matching pattern
  public async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Redis keys error:', error);
      throw new AppError('Failed to get keys', 500);
    }
  }

  // Clear all keys matching pattern
  public async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('Redis clear pattern error:', error);
      throw new AppError('Failed to clear cache pattern', 500);
    }
  }

  // Add to set
  public async sadd(key: string, value: string): Promise<void> {
    try {
      await this.client.sadd(key, value);
    } catch (error) {
      console.error('Redis sadd error:', error);
      throw new AppError('Failed to add to set', 500);
    }
  }

  // Get set members
  public async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      console.error('Redis smembers error:', error);
      throw new AppError('Failed to get set members', 500);
    }
  }

  // Remove from set
  public async srem(key: string, value: string): Promise<void> {
    try {
      await this.client.srem(key, value);
    } catch (error) {
      console.error('Redis srem error:', error);
      throw new AppError('Failed to remove from set', 500);
    }
  }

  // Add to sorted set
  public async zadd(key: string, score: number, member: string): Promise<void> {
    try {
      await this.client.zadd(key, score, member);
    } catch (error) {
      console.error('Redis zadd error:', error);
      throw new AppError('Failed to add to sorted set', 500);
    }
  }

  // Get sorted set range
  public async zrange(key: string, start: number, stop: number, withScores: boolean = false): Promise<string[]> {
    try {
      if (withScores) {
        return await this.client.zrange(key, start, stop, 'WITHSCORES');
      }
      return await this.client.zrange(key, start, stop);
    } catch (error) {
      console.error('Redis zrange error:', error);
      throw new AppError('Failed to get sorted set range', 500);
    }
  }

  // Get sorted set score
  public async zscore(key: string, member: string): Promise<number | null> {
    try {
      const score = await this.client.zscore(key, member);
      return score ? parseFloat(score) : null;
    } catch (error) {
      console.error('Redis zscore error:', error);
      throw new AppError('Failed to get sorted set score', 500);
    }
  }

  // Publish message
  public async publish(channel: string, message: string): Promise<void> {
    try {
      await this.client.publish(channel, message);
    } catch (error) {
      console.error('Redis publish error:', error);
      throw new AppError('Failed to publish message', 500);
    }
  }

  // Subscribe to channel
  public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (ch, message) => {
        if (ch === channel) {
          callback(message);
        }
      });
    } catch (error) {
      console.error('Redis subscribe error:', error);
      throw new AppError('Failed to subscribe to channel', 500);
    }
  }

  // Acquire lock
  public async acquireLock(lockKey: string, ttl: number = 10): Promise<boolean> {
    try {
      const result = await this.client.set(lockKey, 'locked', 'NX', 'EX', ttl);
      return result === 'OK';
    } catch (error) {
      console.error('Redis lock error:', error);
      return false;
    }
  }

  // Release lock
  public async releaseLock(lockKey: string): Promise<void> {
    try {
      await this.client.del(lockKey);
    } catch (error) {
      console.error('Redis unlock error:', error);
    }
  }

  // Get cache with fallback
  public async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    expireSeconds?: number
  ): Promise<T> {
    const cached = await this.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const value = await fallback();
    
    if (value) {
      await this.set(key, JSON.stringify(value), expireSeconds);
    }

    return value;
  }

  // Rate limiter
  public async rateLimit(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    const current = await this.incr(key);
    
    if (current === 1) {
      await this.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, limit - current);
    
    return {
      allowed: current <= limit,
      remaining
    };
  }

  // Get Redis info
  public async getInfo(): Promise<any> {
    try {
      const info = await this.client.info();
      return info;
    } catch (error) {
      console.error('Redis info error:', error);
      throw new AppError('Failed to get Redis info', 500);
    }
  }

  // Flush all
  public async flushAll(): Promise<void> {
    try {
      await this.client.flushall();
    } catch (error) {
      console.error('Redis flush error:', error);
      throw new AppError('Failed to flush Redis', 500);
    }
  }

  // Disconnect
  public async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      await this.subscriber.quit();
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }
}

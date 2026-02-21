// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { RedisService } from '@/services/redis.service';

const redisService = RedisService.getInstance();

// General API rate limiter
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisService.getClient(),
    prefix: 'rate-limit:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter)
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisService.getClient(),
    prefix: 'rate-limit:auth:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login attempts per hour
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// M-Pesa rate limiter
export const mpesaLimiter = rateLimit({
  store: new RedisStore({
    client: redisService.getClient(),
    prefix: 'rate-limit:mpesa:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 M-Pesa requests per minute
  message: 'Too many M-Pesa requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

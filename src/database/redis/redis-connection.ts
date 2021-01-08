import redis from 'redis';

import { redisDatabaseConnectionUri } from '@config/index';

import RateLimiterStore from '@database/redis/rate-limiter-store';

export const client = redis.createClient(redisDatabaseConnectionUri);

export const rateLimiterStoreConfig = RateLimiterStore;

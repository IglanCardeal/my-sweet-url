import redis from 'redis';

import { redisDatabaseConnectionUri } from '@config/index';

export const client = redis.createClient(redisDatabaseConnectionUri);


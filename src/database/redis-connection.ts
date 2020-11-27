import redis from 'redis';
import { config } from 'dotenv';
import util from 'util';

config();

const REDIS_HOST = process.env.REDIS_HOST || 'redis://127.0.0.1:6379';

const client = redis.createClient(REDIS_HOST);

const redisGetAsync = util.promisify(client.get).bind(client);
const redisSetAsync = util.promisify(client.set).bind(client);

export { redisGetAsync, redisSetAsync };

import redis from 'redis';
import { config } from 'dotenv';
import util from 'util';

config();

// quando env de producao, redis roda no container do docker
const REDIS_HOST =
  process.env.NODE_ENV === 'development'
    ? process.env.REDIS_HOST || 'redis://127.0.0.1:6379'
    : process.env.PROD_REDIS_HOST || 'redis://my_sweet_redis:6379';

console.log('============REDIS SERVER============\n');
console.log(`*** Redis database URI: ${REDIS_HOST}`);

const client = redis.createClient(REDIS_HOST);
const redisGetAsync = util.promisify(client.get).bind(client);
const redisSetAsync = util.promisify(client.set).bind(client);
const redisExpire = util.promisify(client.expire).bind(client);

export { redisGetAsync, redisSetAsync, redisExpire };

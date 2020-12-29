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

// tive que usar o paradigma POG (programação orientada a gambiarras)
// para corrigir problemas de parâmetros do TS para o método hmget
type FixBugRedisHmget = (arg1: string, arg2: string) => Promise<string[]>;
type FixBugRedisHdel = (arg1: string, arg2: string) => Promise<number>;

export const client = redis.createClient(REDIS_HOST);
export const redisGetAsync = util.promisify(client.get).bind(client);
export const redisSetAsync = util.promisify(client.set).bind(client);
export const redisExpireAsync = util.promisify(client.expire).bind(client);
export const redisHmsetAsync = util.promisify(client.hmset).bind(client);
export const redisHmgetAsync = util
  .promisify(client.hmget)
  .bind(client) as FixBugRedisHmget;
export const redisHdelAsync = util
  .promisify(client.hdel)
  .bind(client) as FixBugRedisHdel;
export const redisHgetAllAsync = util.promisify(client.hgetall).bind(client);

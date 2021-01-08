import util from 'util';

import { client } from '@database/redis/redis-connection';

// tive que usar o paradigma POG (programação orientada a gambiarras)
// para corrigir problemas de parâmetros do TS para o método hmget
type FixRedisHmgetArguments = (arg1: string, arg2: string) => Promise<string[]>;
type FixRedisHdelArguments = (arg1: string, arg2: string) => Promise<number>;

export const redisGetAsync = util.promisify(client.get).bind(client);

export const redisSetAsync = util.promisify(client.set).bind(client);

export const redisExpireAsync = util.promisify(client.expire).bind(client);

export const redisHmsetAsync = util.promisify(client.hmset).bind(client);

export const redisHmgetAsync = util
  .promisify(client.hmget)
  .bind(client) as FixRedisHmgetArguments;

export const redisHdelAsync = util
  .promisify(client.hdel)
  .bind(client) as FixRedisHdelArguments;

export const redisHgetAllAsync = util.promisify(client.hgetall).bind(client);

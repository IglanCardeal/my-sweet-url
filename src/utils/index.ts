import { signOptions, verifyOptions, ageOfCookie } from './token-options';

import {
  redisExpireAsync,
  redisGetAsync,
  redisHdelAsync,
  redisHgetAllAsync,
  redisHmgetAsync,
  redisHmsetAsync,
  redisSetAsync,
} from './redis';

import checkProtocol from './alias/check-protocol';
import generateAlias from './alias/generate-alias';
import getDomain from './alias/get-domain';

import { throwErrorHandler, catchErrorFunction } from './errors-handlers';

import { rateLimiterMessager } from './rate-limiter-message';

import getAuthToken from './get-token';

// alias
export { checkProtocol, generateAlias, getDomain };

// token
export { signOptions, verifyOptions, ageOfCookie };

// redis
export {
  redisExpireAsync,
  redisGetAsync,
  redisHdelAsync,
  redisHgetAllAsync,
  redisHmgetAsync,
  redisHmsetAsync,
  redisSetAsync,
};

// erros functions
export { throwErrorHandler, catchErrorFunction };

// rate limiter messager function
export { rateLimiterMessager };

export { getAuthToken };

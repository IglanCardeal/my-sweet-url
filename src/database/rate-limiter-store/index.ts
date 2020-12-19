import { RateLimiterRedis } from 'rate-limiter-flexible';

import { client } from '@database/redis-connection';

interface Props {
  maxWrongAttemps: number;
  keyPrefix: string;
  durationSeconds: number;
  blockDurationSeconds: number;
}

const rateLimiterStoreConfig = ({
  maxWrongAttemps,
  keyPrefix,
  durationSeconds,
  blockDurationSeconds,
}: Props) => {
  return new RateLimiterRedis({
    storeClient: client,
    keyPrefix: keyPrefix,
    points: maxWrongAttemps,
    duration: durationSeconds,
    blockDuration: blockDurationSeconds,
  });
};

export default rateLimiterStoreConfig;

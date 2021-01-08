import { RateLimiterRedis } from 'rate-limiter-flexible';

import { client } from '../redis-connection';

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
  const rateLimiterInstance = new RateLimiterRedis({
    storeClient: client,
    keyPrefix: keyPrefix,
    points: maxWrongAttemps,
    duration: durationSeconds,
    blockDuration: blockDurationSeconds,
  });

  return rateLimiterInstance;
};

export default rateLimiterStoreConfig;

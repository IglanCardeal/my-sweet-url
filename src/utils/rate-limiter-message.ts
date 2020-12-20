import { Response } from 'express';

interface Props {
  res: Response;
  message: string;
  reason: string;
  retrySeconds: number;
}

export default async function rateLimiterMessager({
  res,
  message,
  reason,
  retrySeconds,
}: Props) {
  res.set('Retry-After', String(retrySeconds));
  res.status(429).json({
    messsage: message,
    reason,
    retrySeconds,
  });
}

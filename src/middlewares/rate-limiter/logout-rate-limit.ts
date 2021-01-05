import { Request, Response, NextFunction } from 'express';

import rateLimiterMessager from '@utils/rate-limiter-message';
import rateLimiterStoreConfig from '@database/rate-limiter-store';

const maxLogoutsByIPperMinute = 3;

const oneMinute = 60;

const rateLimitConfigSlowBruteByIP = {
  maxWrongAttemps: maxLogoutsByIPperMinute,
  keyPrefix: 'logout_fail_ip_per_day',
  durationSeconds: oneMinute,
  blockDurationSeconds: oneMinute,
};

const limiterSlowBruteByIP = rateLimiterStoreConfig(
  rateLimitConfigSlowBruteByIP,
);

async function userLogoutApiLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const originIpAddress = req.ip;
    const resSlowByIp = await limiterSlowBruteByIP.get(originIpAddress);

    const reason = 'Bloqueado por limite de requisições por endereço IP.';
    let retrySeconds = 0;

    const blockedIp = Boolean(
      resSlowByIp !== null &&
        resSlowByIp.consumedPoints > maxLogoutsByIPperMinute,
    );

    if (blockedIp) {
      retrySeconds = Math.round(resSlowByIp!.msBeforeNext / 1000) || 1;
    }

    if (retrySeconds > 0) {
      console.log(
        `Muitas tentativas em pouco tempo. Tente novamente em ${retrySeconds} segundos.`,
      );

      const responseObject = {
        res,
        message: `Muitas tentativas em pouco tempo. Tente novamente em ${retrySeconds} segundos.`,
        retrySeconds,
        reason,
      };

      rateLimiterMessager(responseObject);

      return;
    }

    try {
      await limiterSlowBruteByIP.consume(originIpAddress);

      next();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      console.log(error);

      const retrySeconds = Math.round(error.msBeforeNext / 1000) || 1;

      const responseObject = {
        res,
        message: `Muitas tentativas em pouco tempo. Tente novamente em ${retrySeconds} segundos.`,
        retrySeconds,
        reason,
      };

      rateLimiterMessager(responseObject);

      return;
    }
  } catch (error) {
    console.log('Erro em API RATE para logout de usuário: ', error);

    next(error);
  }
}

export default userLogoutApiLimit;

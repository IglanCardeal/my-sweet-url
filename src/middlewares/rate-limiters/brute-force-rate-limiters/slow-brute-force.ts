import { Request, Response, NextFunction } from 'express';

import { rateLimiterMessager } from '@utils/index';
import { rateLimiterStoreConfig } from '@database/redis/redis-connection';

const maxAttemptsByIPperDay = 50;
const oneDay = 60 * 60 * 24;

const rateLimitConfigSlowBruteByIp = {
  maxWrongAttemps: maxAttemptsByIPperDay,
  keyPrefix: 'slow_brute_force_fail_ip_per_day',
  durationSeconds: oneDay,
  blockDurationSeconds: oneDay,
};
const limiterSlowBruteByIP = rateLimiterStoreConfig(
  rateLimitConfigSlowBruteByIp,
);

export default async function slowBruteForce(req: Request, res: Response, next: NextFunction) {
  try {
    const originIpAddress = req.ip;
    const resSlowByIP = await limiterSlowBruteByIP.get(originIpAddress);

    const blockedIp = Boolean(
      resSlowByIP !== null &&
        resSlowByIP.consumedPoints > maxAttemptsByIPperDay,
    );

    const reason = 'Bloqueado por limite de requisições por endereço IP.';
    let retrySeconds = 0;

    if (blockedIp) {
      retrySeconds = Math.round(resSlowByIP!.msBeforeNext / 1000) || 1;
    }

    if (retrySeconds > 0) {
      console.log(
        `Numero máximo de requisições para a API foi atingido (limite de ${maxAttemptsByIPperDay} requisições). Tente novamente em ${retrySeconds} segundos.`,
      );

      const responseObject = {
        res,
        message: `Numero máximo de requisições para a API foi atingido (limite de ${maxAttemptsByIPperDay} requisições). Tente novamente em ${retrySeconds} segundos.`,
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
        message: `Numero máximo de requisições para a API foi atingido (limite de ${maxAttemptsByIPperDay} requisições). Tente novamente em ${retrySeconds} segundos.`,
        retrySeconds,
        reason,
      };

      rateLimiterMessager(responseObject);

      return;
    }
  } catch (error) {
    console.log('Erro em API RATE para evitar ataque de forca bruta: ', error);

    next(error);
  }
}

import { Request, Response, NextFunction } from 'express';

import rateLimiterMessager from '@utils/rate-limiter-message';
import rateLimiterStoreConfig from '@database/rate-limiter-store';

const maxSignupByIPperDay = 10;

const twoMinutes = 60 * 2;

const rateLimitConfigSlowBruteByIP = {
  maxWrongAttemps: maxSignupByIPperDay,
  keyPrefix: 'signup_fail_ip_per_day',
  durationSeconds: twoMinutes,
  blockDurationSeconds: twoMinutes,
};
const limiterSlowBruteByIP = rateLimiterStoreConfig(
  rateLimitConfigSlowBruteByIP,
);

async function signupApiLimit(req: Request, res: Response, next: NextFunction) {
  const originIpAddress = req.ip;
  const username = req.body.username;

  if (!username) {
    const error = {
      statusCode: 400,
      message: 'Nome de usuário deve ser informado no cadastro.',
    };

    next(error);

    return;
  }

  try {
    const resSlowByIP = await limiterSlowBruteByIP.get(originIpAddress);

    const reason = 'Bloqueado por limite de requisições por endereço IP.';
    let retrySeconds = 0;

    // verifica se iP ou username + iP foi bloqueado
    const blockedIP = Boolean(
      resSlowByIP !== null && resSlowByIP.consumedPoints > maxSignupByIPperDay,
    );

    if (blockedIP) {
      retrySeconds = Math.round(resSlowByIP!.msBeforeNext / 1000) || 1;
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
    console.log('Erro em API RATE para login de usuario: ', error);

    next(error);
  }
}

export default signupApiLimit;

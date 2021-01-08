import { Request, Response, NextFunction } from 'express';

import { rateLimiterMessager } from '@utils/index';

import { rateLimiterStoreConfig } from '@database/redis/redis-connection';

// retorna um par "username_127.0.0.1"
const getUsernameIPkey = (username: string, ip: string) => `${username}_${ip}`;

const maxConsecutiveFailsByUsernameAndIP = 5;

const oneMinute = 60;

const rateLimitConfigUsernameAndIP = {
  maxWrongAttemps: maxConsecutiveFailsByUsernameAndIP,
  keyPrefix: 'login_fail_consecutive_username_and_ip',
  durationSeconds: oneMinute,
  blockDurationSeconds: oneMinute,
};
const limiterConsecutiveFailsByUsernameAndIP = rateLimiterStoreConfig(
  rateLimitConfigUsernameAndIP,
);

async function userLoginApiLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const originIpAddress = req.ip;
  const username = req.body.username;

  const usernameIPkey = getUsernameIPkey(username, originIpAddress);

  try {
    const resUsernameAndIP = await limiterConsecutiveFailsByUsernameAndIP.get(
      usernameIPkey,
    );

    const reason = 'Bloqueado por limite de requisições por usuário.';
    let retrySeconds = 0;

    // verifica se username+ip foi bloqueado
    const blockedUsernameAndIp = Boolean(
      resUsernameAndIP !== null &&
        resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP,
    );

    if (blockedUsernameAndIp) {
      retrySeconds = Math.round(resUsernameAndIP!.msBeforeNext / 1000) || 1;
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
      await limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey);

      if (!username) {
        const error = {
          statusCode: 400,
          message: 'Nome de usuário deve ser informado.',
        };

        next(error);

        return;
      }

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
    console.log('Erro em API RATE para login de usuário: ', error);

    next(error);
  }
}

export default userLoginApiLimit;

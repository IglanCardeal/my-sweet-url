import { Request, Response, NextFunction } from 'express';

import rateLimiterStoreConfig from '@database/rate-limiter-store';

// retorna um par "username_127.0.0.1"
const getUsernameIPkey = (username: string, ip: string) => `${username}_${ip}`;

const maxWrongAttemptsByIPperDay = 50;
const maxConsecutiveFailsByUsernameAndIP = 5;

const oneMinute = 60;
const oneDay = 60 * 60 * 24;

const rateLimitConfigUsernameAndIP = {
  maxWrongAttemps: maxConsecutiveFailsByUsernameAndIP,
  keyPrefix: 'login_fail_consecutive_username_and_ip',
  durationSeconds: oneMinute,
  blockDurationSeconds: oneMinute,
};
const limiterConsecutiveFailsByUsernameAndIP = rateLimiterStoreConfig(
  rateLimitConfigUsernameAndIP,
);

const rateLimitConfigSlowBruteByIp = {
  maxWrongAttemps: maxWrongAttemptsByIPperDay,
  keyPrefix: 'login_fail_ip_per_day',
  durationSeconds: oneDay,
  blockDurationSeconds: oneDay,
};
const limiterSlowBruteByIP = rateLimiterStoreConfig(
  rateLimitConfigSlowBruteByIp,
);

export default {
  userLoginApiLimit: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const originIpAddress = req.ip;
    const username = req.body.username;

    if (!username) {
      const error = {
        statusCode: 400,
        message: 'Nome de usuário deve ser informado.',
      };

      next(error);

      return;
    }

    const usernameIPkey = getUsernameIPkey(username, originIpAddress);

    try {
      const [resUsernameAndIP, resSlowByIP] = await Promise.all([
        limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
        limiterSlowBruteByIP.get(originIpAddress),
      ]);

      let retrySecs = 0;
      let reason: string;

      // verifica se ip ou username + ip foi bloqueado
      const blockedIp = Boolean(
        resSlowByIP !== null &&
          resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay,
      );
      const blockedUsernameAndIp = Boolean(
        resUsernameAndIP !== null &&
          resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP,
      );

      if (blockedIp) {
        retrySecs = Math.round(resSlowByIP!.msBeforeNext / 1000) || 1;
        reason = 'Bloqueado por limite de requisições por endereço IP.';
      }

      if (blockedUsernameAndIp) {
        retrySecs = Math.round(resUsernameAndIP!.msBeforeNext / 1000) || 1;
        reason = 'Bloqueado por limite de requisições por usuário.';
      }

      if (retrySecs > 0) {
        console.log(
          `Muitas tentativas em pouco tempo. Tente novamente em ${retrySecs} segundos.`,
        );

        res.set('Retry-After', String(retrySecs));
        res.status(429).json({
          messsage: `Muitas tentativas em pouco tempo. Tente novamente em ${retrySecs} segundos.`,
          reason: reason!,
        });

        return;
      }

      try {
        const promises = [
          limiterSlowBruteByIP.consume(originIpAddress),
          limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey),
        ];

        await Promise.all(promises);

        next();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }

        console.log(error);

        let reason: string;

        if (error.consumedPoints <= maxWrongAttemptsByIPperDay)
          reason = 'Bloqueado por limite de requisições por usuário.';
        else reason = 'Bloqueado por limite de requisições por endereço IP.';

        const retrySeconds = String(Math.round(error.msBeforeNext / 1000) || 1);

        res.set('Retry-After', retrySeconds);
        res.status(429).json({
          messsage: `Muitas tentativas em pouco tempo. Tente novamente em ${retrySeconds} segundos.`,
          reason: reason,
        });

        return;
      }
    } catch (error) {
      console.log('Erro em API RATE para login de usuario: ', error);

      next(error);
    }
  },
};

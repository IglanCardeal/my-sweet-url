import { Request, Response, NextFunction } from 'express';

import rateLimiterMessager from '@utils/rate-limiter-message';
import rateLimiterStoreConfig from '@database/rate-limiter-store';

const getUserTokenIPkey = (userToken: string, ip: string) =>
  `${userToken}_${ip}`;

const maxRequestPerHour = 50;

const oneHour = 60 * 60;

const rateLimitConfigUserTokenAndIP = {
  maxWrongAttemps: maxRequestPerHour,
  keyPrefix: 'user_request_limit_by_id_and_ip',
  durationSeconds: oneHour,
  blockDurationSeconds: oneHour,
};
const maxRequestByUserTokenAndIP = rateLimiterStoreConfig(
  rateLimitConfigUserTokenAndIP,
);

async function userRequestApiLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userToken = req.cookies['token'];
  const originIpAddress = req.ip;

  const userTokenIp = getUserTokenIPkey(userToken, originIpAddress);

  try {
    const resUserTokenAndIp = await maxRequestByUserTokenAndIP.get(userTokenIp);

    const reason =
      'Bloqueado por limite de requisições por usuário cadastrado.';
    let retrySeconds = 0;

    const blockedUserTokenAndIP = Boolean(
      resUserTokenAndIp !== null &&
        resUserTokenAndIp.consumedPoints > maxRequestPerHour,
    );

    if (blockedUserTokenAndIP) {
      retrySeconds = Math.round(resUserTokenAndIp!.msBeforeNext / 1000) || 1;
    }

    if (retrySeconds > 0) {
      console.log(
        `Muitas tentativas em pouco tempo. Tente novamente em ${retrySeconds} segundos.`,
      );

      const responseObject = {
        res,
        message: `Muitas tentativas de usuário em pouco tempo. Tente novamente em ${retrySeconds} segundos.`,
        retrySeconds,
        reason,
      };

      rateLimiterMessager(responseObject);

      return;
    }

    try {
      await maxRequestByUserTokenAndIP.consume(userTokenIp);

      // if (!userToken) {
      //   const error = {
      //     statusCode: 400,
      //     message: 'Token deve ser informado para requisições de usuário.',
      //   };

      //   next(error);

      //   return;
      // }

      next();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      console.log(error);

      const retrySeconds = Math.round(error.msBeforeNext / 1000) || 1;

      const responseObject = {
        res,
        message: `Muitas tentativas de usuário em pouco tempo. Tente novamente em ${retrySeconds} segundos.`,
        retrySeconds,
        reason,
      };

      rateLimiterMessager(responseObject);

      return;
    }
  } catch (error) {
    console.log('Erro em API RATE para requisiçoes de usuário: ', error);

    next(error);
  }
}

export default userRequestApiLimit;

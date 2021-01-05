import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

import catchErrorFunction from '@utils/catch-error-function';
import { verifyOptions } from '@utils/sign-verify-token-options';

config();

const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY!;

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies['token'];

  if (!token) {
    const error = {
      statusCode: 401,
      message:
        'Nenhum token informado! Realize o login para adquirir token de autenticação.',
    };

    throw error;
  }

  const format = token.split(' ');
  const doNotStartWithBearer = Boolean(format[0] !== 'Bearer');

  if (doNotStartWithBearer) {
    const error = {
      statusCode: 401,
      message:
        'Token com formato inválido! Realize o login para adquirir token de autenticação em formato válido.',
    };

    throw error;
  }

  const extractedToken = format[1];

  try {
    // const legitToken = jwt.verify(extractedToken, PUBLIC_KEY, verifyOptions);

    // console.log('Token legit?: ',legitToken);
    jwt.verify(extractedToken, PUBLIC_KEY, (err: any, decoded: any) => {
      if (err) {
        res.clearCookie('token');

        const error = {
          statusCode: 401,
          message:
            'Token inválido! Realize o login para obter token válido e acessar esta rota.',
        };

        throw error;
      }

      res.locals.userId = decoded.userId;

      next();
    });
  } catch (error) {
    catchErrorFunction(error, next);
  }
};

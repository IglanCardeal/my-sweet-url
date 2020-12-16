import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

import catchErrorFunction from '@utils/catch-error-function';

config();

const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY!;

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies['token'];

  if (!token) {
    const error = {
      statusCode: 401,
      message:
        'Nenhum token informado! Realize o login para adquirir token de autenticacão.',
    };

    throw error;
  }

  const format = token.split(' ');

  if (format[0] !== 'Bearer') {
    const error = {
      statusCode: 401,
      message:
        'Token com formato inválido! Realize o login para adquirir token de autenticacão em formato válido.',
    };

    throw error;
  }

  const extractedToken = format[1];

  try {
    jwt.verify(extractedToken, PUBLIC_KEY, (err: any, decoded: any) => {
      if (err) {
        res.clearCookie('token');

        const error = {
          statusCode: 401,
          message:
            'Token invalido! Realize o login para obter token válido e acessar esta rota.',
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

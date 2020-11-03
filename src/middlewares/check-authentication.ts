import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

import catchErrorFunction from '../utils/catch-error-function';

config();

const SECRET = process.env.JWT_SECRET || 'chavesecretaaleatoria';

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies['token'];

  if (!token) {
    const error = {
      statusCode: 401,
      message:
        'Nenhum token informado! Realize o login para adquirir token de autenticacao.',
    };

    throw error;
  }

  try {
    jwt.verify(token, SECRET, async (err: any, decoded: any) => {
      if (err) {
        res.clearCookie('token');

        const error = {
          statusCode: 401,
          message:
            'Token invalido! Realize o login para obter token valido e acessar esta rota.',
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

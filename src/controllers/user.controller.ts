import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

import { db } from '../database/connection';
import { userSchema } from '../utils/schemas';
import catchErrorFunction from '../utils/catch-error-function';

config();

const users = db.get('users');
const SECRET = process.env.JWT_SECRET || 'chavesecretaaleatoria';

export default {
  async login(req: Request, res: Response, next: NextFunction) {
    let { username, password } = req.body;
    let validPassword;

    username = username.toString().toLowerCase();

    try {
      await userSchema.validate({ username, password });
      const userFound = { _id: '' };
      // const userFound = await users.findOne({ username });

      // if (!userFound) {
      //   const error = {
      //     statusCode: 404,
      //     message: 'Usuario nao encontrado! Tente novamente',
      //   };

      //   throw error;
      // }

      // await bcrypt.compare(password, userFound.password, (err, result) => {
      //   if (err) {
      //     const error = {
      //       statusCode: 500,
      //       message:
      //         'Erro interno de servidor ao tentar verificar senha de usuario.',
      //     };

      //     throw error;
      //   }
      //   validPassword = result;
      // });

      // if (!validPassword) {
      //   const error = {
      //     statusCode: 401,
      //     message: 'Senha de usuario usuario incorreta! Tente novamente.',
      //   };

      //   throw error;
      // }

      jwt.sign(
        { userId: userFound._id },
        SECRET,
        {
          expiresIn: '1h', // 1 hora
        },
        callback,
      );

      function callback(err: any, token: any) {
        if (err) {
          console.log(err);
          const error = {
            message:
              'Erro interno de servidor ao tentar gerar token de autenticacao.',
            statusCode: 500,
          };

          throw error;
        }

        userFound._id = '123';

        res.status(200).json({
          message: 'Usuario autenticado com sucesso',
          token: token,
        });
      }
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  async signup(req: Request, res: Response, next: NextFunction) {},

  async toShortUrlByUser() {},
};

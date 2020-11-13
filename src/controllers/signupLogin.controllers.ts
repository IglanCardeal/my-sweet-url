import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

import { userLoginSchema, userSignupSchema } from '@utils/schemas';
import { db } from '@database/connection';
import catchErrorFunction from '@utils/catch-error-function';

config();

const users = db.get('users');
const SECRET = process.env.JWT_SECRET || 'chavesecretaaleatoria';
const env = process.env.NODE_ENV;

export default {
  async login(req: Request, res: Response, next: NextFunction) {
    let { username, password } = req.body;

    username = username.trim().toLowerCase();

    try {
      await userLoginSchema.validate({ username, password });

      const userFound = await users.findOne({ username });

      if (!userFound) {
        const error = {
          statusCode: 404,
          message: 'Usuário não encontrado! Tente novamente',
        };

        throw error;
      }

      bcrypt.compare(password, userFound.password, (err, result) => {
        if (err) {
          const error = {
            statusCode: 500,
            message:
              'Erro interno de servidor ao tentar verificar senha de usuário.',
          };

          throw error;
        }

        const isPasswordValid = result;

        if (!isPasswordValid) {
          const error = {
            statusCode: 401,
            message: 'Senha de usuário usuário incorreta! Tente novamente.',
          };

          throw error;
        }

        const maxAgeOfCookie =
          env === 'development'
            ? 60 * 60 * 1000 * 1000 // mil horas
            : 60 * 60 * 1000; // 1 hora
        const token = jwt.sign({ userId: userFound._id }, SECRET, {
          expiresIn: maxAgeOfCookie,
        });

        res.cookie('token', `Bearer ${token}`, {
          maxAge: maxAgeOfCookie,
          httpOnly: true,
          secure: false,
          sameSite: true,
        });

        res.status(200).json({
          message: 'Usuário autenticado com sucesso',
        });
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  async signup(req: Request, res: Response, next: NextFunction) {
    const { email, username, password } = req.body;

    try {
      await userSignupSchema.validate({ email, username, password });

      const userAlreadyExist = await users.findOne({ email });

      if (userAlreadyExist) {
        const error = {
          statusCode: 401,
          message: 'Email informado ja cadastrado! Use outro email.',
        };

        throw error;
      }

      bcrypt.hash(password, 12, async (err, hash) => {
        if (err) {
          const error = {
            statusCode: 500,
            message: 'Error interno de servidor ao salvar senha de usuário.',
          };

          throw error;
        }

        const newUser = {
          email,
          username,
          password: hash,
        };

        await users.insert(newUser);

        res.status(201).json({
          message: 'Usuário cadastrado com sucesso!',
        });
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  logout(req: Request, res: Response, next: NextFunction) {
    res.clearCookie('token');

    res.status(205).json({ message: 'Logout relizado com sucesso!' });
  },
};

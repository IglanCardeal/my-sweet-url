import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

import { userLoginSchema, userSignupSchema } from '@utils/schemas';
import { db } from '@database/connection';
import catchErrorFunction from '@utils/catch-error-function';
import throwErrorHandler from '@utils/throw-error-handler';

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
        throwErrorHandler(404, 'Usuário não encontrado! Tente novamente');
      }

      bcrypt.compare(password, userFound.password, (err, result) => {
        if (err) {
          throwErrorHandler(
            500,
            'Erro interno de servidor ao tentar verificar senha de usuário',
          );
        }

        const isPasswordValid = result;

        if (!isPasswordValid) {
          throwErrorHandler(
            401,
            'Senha de usuário usuário incorreta! Tente novamente.',
          );
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
    let { email, username, password } = req.body;

    email = email.trim();
    username = username.trim().toLowerCase();
    password = password.trim();

    try {
      await userSignupSchema.validate({ email, username, password });

      const userAlreadyExist = await users.findOne({ email });

      if (userAlreadyExist) {
        throwErrorHandler(
          401,
          'Email informado ja cadastrado! Use outro email.',
        );
      }

      bcrypt.hash(password, 12, async (err, hash) => {
        if (err) {
          throwErrorHandler(
            500,
            'Error interno de servidor ao salvar senha de usuário.',
          );
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

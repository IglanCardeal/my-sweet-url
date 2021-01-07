import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { promisify } from 'util';

import { userLoginSchema, userSignupSchema } from '@schemas/schemas';

import { db } from '@database/connection';
import catchErrorFunction from '@utils/catch-error-function';
import throwErrorHandler from '@utils/throw-error-handler';
import { signOptions, ageOfCookie } from '@utils/sign-verify-token-options';

import { JWT_PRIVATE_KEY } from '@config/index';

const users = db.get('users');

export default {
  async login(req: Request, res: Response, next: NextFunction) {
    let { username, password } = req.body;

    username = username.trim().toLowerCase();

    try {
      await userLoginSchema.validate({ username, password });

      const userFound = await users.findOne({ username });

      if (!userFound) {
        throwErrorHandler(404, 'Usuário não encontrado! Tente novamente', next);

        return;
      }

      const comparedPassword = await bcrypt.compare(
        password,
        userFound.password,
      );

      if (!comparedPassword) {
        throwErrorHandler(
          401,
          'Senha de usuário usuário incorreta! Tente novamente.',
          next,
        );

        return;
      }

      type FixSignArgumenst = (
        payload: any,
        secretOrPrivateKey: string,
        options: any,
      ) => Promise<string>;

      const jwtSignAsync = promisify(jwt.sign).bind(jwt) as FixSignArgumenst;
      const payload = { userId: userFound._id };
      const token = await jwtSignAsync(payload, JWT_PRIVATE_KEY, signOptions);

      res.cookie('Authorization', `Bearer ${token}`, {
        maxAge: ageOfCookie,
        httpOnly: true,
        secure: false,
        sameSite: true,
      });

      res.status(200).json({
        message: 'Usuário autenticado com sucesso',
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
          next,
        );

        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = {
        email,
        username,
        password: hashedPassword,
      };

      await users.insert(newUser);

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  logout(req: Request, res: Response, next: NextFunction) {
    res.clearCookie('Authorization');

    res.status(205).json({ message: 'Logout relizado com sucesso!' });
  },
};

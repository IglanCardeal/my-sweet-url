import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { nanoid } from 'nanoid';

import { db } from '../database/connection';
import { userLoginSchema, userSignupSchema, urlSchema } from '../utils/schemas';
import catchErrorFunction from '../utils/catch-error-function';

config();

const users = db.get('users');
const urls = db.get('urls');
const SECRET = process.env.JWT_SECRET || 'chavesecretaaleatoria';
const env = process.env.NODE_ENV;
const { APP_HOST } = process.env;

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
          message: 'Usuario nao encontrado! Tente novamente',
        };

        throw error;
      }

      bcrypt.compare(password, userFound.password, (err, result) => {
        if (err) {
          const error = {
            statusCode: 500,
            message:
              'Erro interno de servidor ao tentar verificar senha de usuario.',
          };

          throw error;
        }

        const isPasswordValid = result;

        if (!isPasswordValid) {
          const error = {
            statusCode: 401,
            message: 'Senha de usuario usuario incorreta! Tente novamente.',
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

        res.cookie('token', token, {
          maxAge: maxAgeOfCookie,
          httpOnly: true,
          secure: false,
          sameSite: true,
        });

        res.status(200).json({
          message: 'Usuario autenticado com sucesso',
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
            message: 'Error interno de servidor ao salvar senha de usuario.',
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
          message: 'Usuario cadastrado com sucesso!',
        });
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  async userShowUrls(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals;

    try {
      const userUrls = await urls.find({ userId: userId });

      const userUrlsFormated = userUrls.map(url => {
        return { ...urls, shorteredUrl: `${APP_HOST}/user/url/${url.alias}` };
      });

      res.status(200).json({ message: 'Todas as urls do usuario', userUrls });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  async userRedirectUrl(req: Request, res: Response, next: NextFunction) {
    const { alias } = req.params;

    try {
      const url = await urls.findOne({ alias });

      if (!url?.url) {
        const error = {
          message: 'Nenhuma URL encontrada com este apelido.',
          statusCode: 404,
        };

        throw error;
      }

      const number_access = url.number_access + 1;

      urls.findOneAndUpdate(
        { alias },
        {
          $set: {
            number_access: number_access,
          },
        },
      );

      return res.status(308).redirect(url.url);
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  async userToShortUrl(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals;
    let { alias, url, publicStatus } = req.body;

    try {
      if (!alias) alias = nanoid(7);

      if (!(typeof publicStatus === 'boolean')) publicStatus = false;

      await urlSchema.validate({ alias, url, publicStatus, userId });

      alias = alias.toLowerCase();

      const aliasExist = await urls.findOne({ alias });

      if (aliasExist) {
        const error = {
          message: 'Apelido informado ja existe! Tente outro nome.',
          statusCode: 403,
        };

        throw error;
      }

      const date = new Date().toLocaleDateString('br');

      const newUrl = {
        alias,
        url,
        publicStatus,
        userId,
        date,
        number_access: 0,
      };

      await urls.insert(newUrl);

      res.status(201).json({
        message: 'URL salva com sucesso!',
        urlSaved: {
          alias,
          url,
          publicStatus,
          date,
          shorteredUrl: `${APP_HOST}/user/url/${alias}`,
        },
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  async userEditUrl(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals;
    const { alias, url, publicStatus } = req.body;

    try {
      await urlSchema.validate({ alias, url, publicStatus, userId });

      const [userFounded, urlsFounded] = await Promise.all([
        users.findOne({ _id: userId }),
        urls.find({ userId, alias }),
      ]);

      if (!userFounded) {
        const error = {
          statusCode: 404,
          message: 'Usuario nao encontrado! Faca o login novamente.',
        };

        throw error;
      }

      if (!urlsFounded) {
        const error = {
          statusCode: 404,
          message: 'Url nao encontrada!',
        };

        throw error;
      }

      console.log(urlsFounded, userFounded);

      res.status(200).json({ message: 'Url editada com sucesso!' });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  async userDeletUrl(req: Request, res: Response, next: NextFunction) {},

  async userLogout(req: Request, res: Response, next: NextFunction) {},
};

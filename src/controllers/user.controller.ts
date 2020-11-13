import { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { nanoid } from 'nanoid';

import { db } from '../database/connection';
import { urlSchema } from '../utils/schemas';
import catchErrorFunction from '../utils/catch-error-function';

config();

const users = db.get('users');
const urls = db.get('urls');
const { APP_HOST } = process.env;

export default {
  async userShowUrls(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals;

    try {
      const userUrls = await urls.find({ userId: userId });

      const userUrlsFormated = userUrls.map(url => {
        return {
          alias: url.alias,
          url: url.url,
          date: url.date,
          publicStatus: url.publicStatus,
          number_access: url.number_access,
          shorteredUrl: `${APP_HOST}/${url.alias}`,
        };
      });

      res
        .status(200)
        .json({ message: 'Todas as urls do usuário', userUrlsFormated });
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
          message: 'Apelido informado já existe! Tente outro nome.',
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
      await urlSchema.validate({ alias, url, userId, publicStatus });

      const [userFounded, urlsFounded] = await Promise.all([
        users.findOne({ _id: userId }),
        urls.find({ userId, alias, url }),
      ]);

      if (!userFounded) {
        const error = {
          statusCode: 404,
          message: 'Usuário não encontrado! Faça o login novamente.',
        };

        throw error;
      }

      if (!urlsFounded) {
        const error = {
          statusCode: 404,
          message: 'Url não encontrada!',
        };

        throw error;
      }

      console.log(urlsFounded, userFounded);

      const updatedUrl = await urls.findOneAndUpdate(
        { userId: userId },
        { $set: { alias: alias, url: url } },
      );

      res.status(200).json({
        message: 'Url editada com sucesso!',
        updatedUrl: {
          alias: updatedUrl.alias,
          url: updatedUrl.url,
        },
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },
};

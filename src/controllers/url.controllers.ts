import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';

import { db } from '../database/connection';
import { urlSchema } from '../utils/schemas';

const urls = db.get('urls');

urls.createIndex('alias');
urls.createIndex('date');

// definindo o formato dos parametros antes
// de salvar no banco

export default {
  async showPublicUrls(req: Request, res: Response, next: NextFunction) {
    try {
      const publicUrls = await urls.find({}, '-userId -_id');

      console.log(publicUrls);
      res.status(200).json({
        message: 'Todas as URLs publicas.',
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  },

  async redirectToUrl(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const url = await urls.findOne({ alias: id });

      if (url?.url) {
        return res.redirect(url);
      }

      const error = {
        message: 'Nenhuma URL encontrada com este apelido.',
        statusCode: 404,
      };

      throw error;
    } catch (error) {
      console.log(error);
      return next(error);
    }
  },

  async toShortUrlAnonymous(req: Request, res: Response, next: NextFunction) {
    let { alias, url } = req.body;

    // valores padrao para cadastro anonimo
    let publicStatus = true;
    let userId = '0';

    try {
      if (!alias) alias = nanoid(7);

      await urlSchema.validate({ alias, url, publicStatus, userId });

      const aliasExist = await urls.findOne({ alias });

      if (aliasExist) {
        const error = {
          message: 'Apelido informado ja existe! Tente outro nome.',
          statusCode: 403,
        };

        throw error;
      }

      alias = alias.toLowerCase();

      const date = new Date();

      const newUrl = {
        alias,
        url,
        publicStatus,
        userId,
        date,
        number_access: 0,
      };

      const shortUrlCreated = await urls.insert(newUrl);

      res
        .status(200)
        .json({ message: 'Nova URL adicionada com sucesso.', newUrl });
    } catch (error) {
      if (error.errors?.length > 0) {
        console.log(error);
        const message = error.errors[0];

        error = {
          message,
          statusCode: 403,
        };

        return next(error);
      }

      console.log(error);
      return next(error);
    }
  },
};

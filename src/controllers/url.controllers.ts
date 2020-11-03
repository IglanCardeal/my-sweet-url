import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { config } from 'dotenv';

import { db } from '../database/connection';
import { urlSchema, urlToFilter } from '../utils/schemas';
import catchErrorFunction from '../utils/catch-error-function';

config();

const { APP_HOST } = process.env;

const urls = db.get('urls');

urls.createIndex('alias');
urls.createIndex('date');

export default {
  async publicShowUrls(req: Request, res: Response, next: NextFunction) {
    const paginate = Number(req.query.page) ? Number(req.query.page) * 10 : 0;
    const paginateToFloor = Math.floor(paginate);

    try {
      // ignorar erro TS no array ['-userId','-_id']
      const publicUrls = await urls.find(
        { publicStatus: true },
        ['-userId', '-_id'],
        {
          limit: 10,
          skip: paginateToFloor,
        },
      );

      const urlsWithShortenedUrls = publicUrls.map(url => {
        return { ...url, shorteredUrl: `${APP_HOST}/url/${url.alias}` };
      });

      res.status(200).json({
        message: 'Todas as URLs publicas.',
        ['public_urls']: urlsWithShortenedUrls,
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  async publicShowFilteredUrls(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const alias = req.body.alias || '1',
      url = req.body.url;
    let urlsFiltereds;

    try {
      if (url) {
        await urlToFilter.validate({ url });

        urlsFiltereds = await urls.find({
          url: url.trim(),
          publicStatus: true,
        });
      } else {
        await urlToFilter.validate({ alias });

        urlsFiltereds = await urls.find({
          alias: alias.trim(),
          publicStatus: true,
        });
      }

      const urlsFilteredsWithShortenedUrls = urlsFiltereds.map(url => {
        return { ...url, shorteredUrl: `${APP_HOST}/url/${url.alias}` };
      });

      res.status(200).json({
        message: 'Todas as URLs publicas filtradas.',
        ['filtered_public_urls']: urlsFilteredsWithShortenedUrls,
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  async publicRedirectToUrl(req: Request, res: Response, next: NextFunction) {
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

  async publicToShortUrl(req: Request, res: Response, next: NextFunction) {
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

      const date = Date.now();

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
        message: 'Nova URL adicionada com sucesso.',
        urlCreated: {
          alias,
          url,
          shortenedUrl: `${APP_HOST}/url/${alias}`,
          ['public_status']: publicStatus,
          date,
        },
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },
};

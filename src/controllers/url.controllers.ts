import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { config } from 'dotenv';
import path from 'path';

import { db } from '@database/connection';
import { urlSchema, urlToFilter } from '@utils/schemas';
import catchErrorFunction from '@utils/catch-error-function';
import throwErrorHandler from '@utils/throw-error-handler';

config();

const { APP_HOST } = process.env;

const urls = db.get('urls');

urls.createIndex('alias');
urls.createIndex('date');
urls.createIndex('number_access');

export default {
  async publicShowUrls(req: Request, res: Response, next: NextFunction) {
    const orderByArray = ['alias', 'date', 'number_access'];
    const paginate = Number(req.query.page) ? Number(req.query.page) * 10 : 0;
    const paginateToFloor = Math.floor(paginate);
    let orderBy = req.query.orderby?.toString() || '';

    const validOrderBy = orderByArray.includes(orderBy);

    if (!validOrderBy) orderBy = 'alias';

    console.log(orderBy);

    const sortOrderBaseOnParameter = {
      date: -1,
      alias: 1,
      number_access: -1,
    };

    try {
      const publicUrls = await urls.find(
        { publicStatus: true },
        {
          limit: 10,
          skip: paginateToFloor,
          sort: {
            [orderBy]: sortOrderBaseOnParameter[orderBy],
          },
        },
      );

      const urlsWithShortenedUrls = publicUrls.map(url => {
        return {
          alias: url.alias,
          url: url.url,
          date: url.date,
          publicStatus: url.publicStatus,
          number_access: url.number_access,
          shorteredUrl: `${APP_HOST}/${url.alias}`,
        };
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
        return {
          alias: url.alias,
          url: url.url,
          date: url.date,
          publicStatus: url.publicStatus,
          number_access: url.number_access,
          shorteredUrl: `${APP_HOST}/${url.alias}`,
        };
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
        return res.sendFile(path.join(__dirname, '../public', '404.html'));
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

      res.status(308).redirect(url.url);
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
        throwErrorHandler(
          403,
          'Apelido informado já existe! Tente outro nome.',
        );
      }

      alias = alias.toLowerCase();

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
        message: 'Nova URL adicionada com sucesso.',
        urlCreated: {
          alias,
          url,
          shortenedUrl: `${APP_HOST}/${alias}`,
          ['public_status']: publicStatus,
          date,
        },
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },
};

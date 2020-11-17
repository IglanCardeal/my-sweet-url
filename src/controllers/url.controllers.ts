import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { config } from 'dotenv';
import path from 'path';

import { db } from '@database/connection';
import { urlSchema, domainValidator, urlToFilter } from '@utils/schemas';
import catchErrorFunction from '@utils/catch-error-function';
import throwErrorHandler from '@utils/throw-error-handler';
import getDomain from '@utils/get-domain';

config();

const { APP_HOST } = process.env;

const urls = db.get('urls');

urls.createIndex('alias');
urls.createIndex('date');
urls.createIndex('number_access');

export default {
  async publicShowUrls(req: Request, res: Response, next: NextFunction) {
    let orderBy = req.query.orderby?.toString() || '';

    const orderByArray = ['alias', 'date', 'number_access', 'domain'];

    const paginate = Number(req.query.page) ? Number(req.query.page) * 10 : 0;
    const paginateToFloor = Math.floor(paginate);

    const validOrderBy = orderByArray.includes(orderBy);

    if (!validOrderBy) orderBy = 'alias';

    const sortOrderBaseOnParameter = {
      date: -1,
      alias: 1,
      number_access: -1,
      domain: 1,
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
          domain: url.domain,
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
    let findBy = req.query.findby?.toString().trim() || '';
    const value = req.query.value?.toString().trim();

    const findByArray = ['alias', 'domain'];
    const validFindBy = findByArray.includes(findBy);

    let urlsFiltereds;

    try {
      if (!validFindBy) {
        throwErrorHandler(
          403,
          'Campo de busca inválido. Somente apelido (alias) ou dominio (domain) são aceitos no filtro.',
        );
      }

      if (findBy === 'domain') {
        await domainValidator.validate({ domain: value });

        urlsFiltereds = await urls.find({
          [findBy]: value,
          publicStatus: true,
        });
      } else {
        // coloquei urls.findOne pois o alias unico
        await urlToFilter.validate({ alias: value });

        urlsFiltereds = await urls.findOne({
          [findBy]: value,
          publicStatus: true,
        });
      }

      urlsFiltereds = await urls.find({
        [findBy]: value,
        publicStatus: true,
      });

      const urlsFilteredsWithShortenedUrls = urlsFiltereds.map(url => {
        return {
          alias: url.alias,
          url: url.url,
          date: url.date,
          publicStatus: url.publicStatus,
          number_access: url.number_access,
          domain: url.domain,
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
      if (!alias) alias = nanoid(5);

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
      const domain = getDomain(url);

      const newUrl = {
        alias,
        url,
        publicStatus,
        userId,
        domain,
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
          domain,
          ['public_status']: publicStatus,
          date,
        },
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },
};

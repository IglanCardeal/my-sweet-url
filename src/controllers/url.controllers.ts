import { Request, Response, NextFunction } from 'express';
// import { nanoid } from 'nanoid';
import { config } from 'dotenv';
import path from 'path';

import { db } from '@database/connection';
import {
  redisGetAsync,
  redisSetAsync,
  redisExpireAsync,
} from '@database/redis-connection';

import { urlSchema, domainValidator, urlToFilter } from '@utils/schemas';
import catchErrorFunction from '@utils/catch-error-function';
import throwErrorHandler from '@utils/throw-error-handler';
import getDomain from '@utils/get-domain';
import checkProtocol from '@utils/check-protocol';
import orderingUrls from '@utils/ordering-urls';
import generateAlias from '@utils/generate-alias';

config();

const { APP_HOST } = process.env;

const urls = db.get('urls');

urls.createIndex('alias');
urls.createIndex('date');
urls.createIndex('number_access');

export default {
  async publicShowUrls(req: Request, res: Response, next: NextFunction) {
    try {
      const publicUrls = await orderingUrls(urls, req);

      const urlsWithShortenedUrls = publicUrls.map(url => {
        return {
          alias: url.alias,
          url: url.url,
          createdAt: url.createdAt,
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
    const paginate = Number(req.query.page) ? Number(req.query.page) * 10 : 0;
    const paginateToFloor = Math.floor(paginate);
    const paginationLimit = 10; // limite de 10 por causa da busca por dominio
    const findByArray = ['alias', 'domain'];
    const validFindBy = findByArray.includes(findBy);

    let urlsFiltereds;

    try {
      if (!validFindBy) {
        throwErrorHandler(
          403,
          'Campo de busca inválido. Somente apelido (alias) ou dominio (domain) são aceitos no filtro.',
          next,
        );

        return;
      }

      if (findBy === 'domain')
        await domainValidator.validate({ domain: value });
      else await urlToFilter.validate({ alias: value });

      const redisPublicKey = `public_findby_${findBy}=${value}_page${paginateToFloor}`;
      const cachedPublicQuery = await redisGetAsync(redisPublicKey);

      if (cachedPublicQuery) {
        const result = JSON.parse(cachedPublicQuery);

        return res.status(200).json({
          message: 'Todas as URLs publicas filtradas.',
          ['filtered_public_urls']: result,
        });
      }

      urlsFiltereds = await urls.find(
        {
          [findBy]: value,
          publicStatus: true,
        },
        {
          limit: paginationLimit,
          skip: paginateToFloor,
        },
      );

      const urlsFilteredsWithShortenedUrls = urlsFiltereds.map(url => {
        return {
          alias: url.alias,
          url: url.url,
          createdAt: url.createdAt,
          publicStatus: url.publicStatus,
          number_access: url.number_access,
          domain: url.domain,
          shorteredUrl: `${APP_HOST}/${url.alias}`,
        };
      });

      await redisSetAsync(
        redisPublicKey,
        JSON.stringify(urlsFilteredsWithShortenedUrls),
      );

      const redisExpirationTimeInSeconds = 10;

      redisExpireAsync(redisPublicKey, redisExpirationTimeInSeconds);

      res.status(200).json({
        message: 'Todas as URLs publicas filtradas.',
        ['filtered_public_urls']: urlsFilteredsWithShortenedUrls,
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  async publicRedirectToUrl(req: Request, res: Response, next: NextFunction) {
    // Redirecionamento padrao para todos
    const { alias } = req.params;

    try {
      const url = await urls.findOne({ alias });

      if (!url?.url) {
        return res.sendFile(path.join(__dirname, '../public', '404.html'));
      }

      const updatedNumberAccess = url.number_access + 1;

      urls.findOneAndUpdate(
        { alias },
        {
          $set: {
            number_access: updatedNumberAccess,
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
      if (!alias) alias = 'undefined'; // criei apenas para passar no validator

      await urlSchema.validate({ alias, url, publicStatus, userId });

      if (alias === 'undefined') {
        alias = await generateAlias(7);
      } else {
        const aliasExist = await urls.findOne({ alias });

        if (aliasExist) {
          throwErrorHandler(
            403,
            'Apelido informado já existe! Tente outro nome.',
            next,
          );

          return;
        }
      }

      const date = new Date().toLocaleDateString('br');
      const domain = getDomain(url);
      const urlWithProtocol = checkProtocol(url);

      const newUrl = {
        alias,
        url: urlWithProtocol,
        publicStatus,
        userId,
        domain,
        createdAt: date,
        number_access: 0,
      };

      await urls.insert(newUrl);

      res.status(201).json({
        message: 'Nova URL adicionada com sucesso.',
        urlCreated: {
          alias,
          url: urlWithProtocol,
          shortenedUrl: `${APP_HOST}/${alias}`,
          domain,
          ['public_status']: publicStatus,
          createdAt: date,
        },
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },
};

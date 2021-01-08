import { Request, Response, NextFunction } from 'express';

import path from 'path';

import { UrlsRepository } from '@models/index';

import {
  redisGetAsync,
  redisSetAsync,
  redisExpireAsync,
  redisHmgetAsync,
  redisHmsetAsync,
} from '@utils/index';

import {
  catchErrorFunction,
  throwErrorHandler,
  getDomain,
  checkProtocol,
  generateAlias,
} from '@utils/index';

import { applicationHost } from '@config/index';

export default {
  async publicShowUrls(req: Request, res: Response, next: NextFunction) {
    let orderBy = req.query.orderby?.toString() || '';

    const orderByArray = ['alias', 'date', 'number_access', 'domain'];
    const indexOfOrderBy = orderByArray.indexOf(orderBy);
    const invalidOrderByValue = Boolean(indexOfOrderBy < 0);
    const paginate = Number(req.query.page) ? Number(req.query.page) * 10 : 0;
    const paginateToFloor = Math.floor(paginate);
    const paginationLimit = 10;

    const sortOrderBaseOnParameter = {
      date: -1,
      alias: 1,
      number_access: -1,
      domain: 1,
    };

    if (invalidOrderByValue) orderBy = 'alias';

    try {
      const redisKeyPublic = `public_order-${orderBy}_page-${paginateToFloor}`;
      const cachedPublicQuery = await redisGetAsync(redisKeyPublic);

      if (cachedPublicQuery) {
        // console.log('SERVINDO Urls publicas do Cache');
        const result = JSON.parse(cachedPublicQuery);

        res.status(200).json({
          message: 'Todas as URLs publicas.',
          ['public_urls']: result,
        });

        return;
      }

      const publicUrlsArray = await UrlsRepository.find(
        { publicStatus: true },
        {
          limit: paginationLimit,
          skip: paginateToFloor,
          sort: {
            [orderBy]: sortOrderBaseOnParameter[orderBy],
          },
        },
      );

      // console.log('Salvando urls publicas no Cache');

      await redisSetAsync(redisKeyPublic, JSON.stringify(publicUrlsArray));

      const twoMinutes = 120;

      const redisPublicExpirationTimeInSeconds = twoMinutes;

      redisExpireAsync(redisKeyPublic, redisPublicExpirationTimeInSeconds);

      const urlsWithShortenedUrls = publicUrlsArray.map(url => {
        return {
          alias: url.alias,
          url: url.url,
          createdAt: url.createdAt,
          publicStatus: url.publicStatus,
          domain: url.domain,
          number_access: url.number_access,
          shorteredUrl: `${applicationHost}/${url.alias}`,
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
    let urlsFiltereds;

    const value = req.query.value?.toString().trim();
    const paginate = Number(req.query.page) ? Number(req.query.page) * 10 : 0;
    const paginateToFloor = Math.floor(paginate);
    const paginationLimit = 10; // limite de 10 por causa da busca por domínio

    try {
      const redisPublicKey = `public_filterby_${findBy}=${value}_page${paginateToFloor}`;
      const cachedPublicQuery = await redisGetAsync(redisPublicKey);

      if (cachedPublicQuery) {
        const result = JSON.parse(cachedPublicQuery);

        res.status(200).json({
          message: 'Todas as URLs publicas filtradas.',
          ['filtered_public_urls']: result,
        });

        return;
      }

      urlsFiltereds = await UrlsRepository.find(
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
          shorteredUrl: `${applicationHost}/${url.alias}`,
        };
      });

      await redisSetAsync(
        redisPublicKey,
        JSON.stringify(urlsFilteredsWithShortenedUrls),
      );

      const oneMinute = 60;

      const redisExpirationTimeInSeconds = oneMinute;

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
    const { alias } = req.params;

    try {
      // verifica se existe no cache para melhorar performance
      const urlFoundedOnCache = await redisHmgetAsync('cached_alias', alias);

      if (urlFoundedOnCache[0]) {
        res.status(308).redirect(urlFoundedOnCache[0]);

        const urlToUpdate = await UrlsRepository.findOne({ alias });

        const updatedNumberAccess = urlToUpdate.number_access + 1;

        UrlsRepository.findOneAndUpdate(
          { alias },
          {
            $set: {
              number_access: updatedNumberAccess,
            },
          },
        );

        return;
      }

      const url = await UrlsRepository.findOne({ alias });

      if (!url?.url) {
        // se não achar o alias, retorna pagina 404
        res.sendFile(path.join(__dirname, '../public', '404.html'));

        return;
      }

      const updatedNumberAccess = url.number_access + 1;

      UrlsRepository.findOneAndUpdate(
        { alias },
        {
          $set: {
            number_access: updatedNumberAccess,
          },
        },
      );

      redisHmsetAsync(['cached_alias', url.alias, url.url]);

      res.status(308).redirect(url.url);
    } catch (error) {
      // console.log(error.errors[0]);

      res.sendFile(path.join(__dirname, '../public', '404.html'));
      // catchErrorFunction(error, next);
    }
  },

  async publicToShortUrl(req: Request, res: Response, next: NextFunction) {
    let { alias, url } = req.body;
    // valores padrao para cadastro anonimo
    let publicStatus = true;
    let userId = '0';

    url = checkProtocol(url); // verifica se já vem com protocolo HTTP

    try {
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

      const newUrl = {
        alias,
        url,
        publicStatus,
        userId,
        domain,
        createdAt: date,
        number_access: 0,
      };

      // salva no cache
      await redisHmsetAsync(['cached_alias', alias, url]);

      UrlsRepository.insert(newUrl);

      res.status(201).json({
        message: 'Nova URL adicionada com sucesso.',
        urlCreated: {
          alias,
          url,
          shortenedUrl: `${applicationHost}/${alias}`,
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

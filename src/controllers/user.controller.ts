import { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
// import { nanoid } from 'nanoid';

import { db } from '@database/connection';

import { userUrlSchema } from '@utils/schemas';
import catchErrorFunction from '@utils/catch-error-function';
import throwErrorHandler from '@utils/throw-error-handler';
import getDomain from '@utils/get-domain';
import checkProtocol from '@utils/check-protocol';
// import orderingUrls from '@utils/ordering-urls';
import generateAlias from '@utils/generate-alias';

import {
  redisHmsetAsync,
  redisHdelAsync,
  redisGetAsync,
  redisSetAsync,
  redisExpireAsync,
} from '@database/redis-connection';

config();

const users = db.get('users');
const urls = db.get('urls');
const { APP_HOST } = process.env;

export default {
  async userShowUrls(req: Request, res: Response, next: NextFunction) {
    let orderBy = req.query.orderby?.toString().trim() || '';

    const { userId } = res.locals;
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
      const redisKeyUser = `user_${userId}_order-${orderBy}_page-${paginateToFloor}`;
      const cachedUserQuery = await redisGetAsync(redisKeyUser);

      if (cachedUserQuery) {
        // console.log('SERVINDO Urls usuario do Cache');
        const result = JSON.parse(cachedUserQuery);

        res
          .status(200)
          .json({
            message: 'Todas as urls do usuário',
            userUrlsFormated: result,
          });
        return;
      }

      const userUrls = await urls.find(
        { userId: userId },
        {
          limit: paginationLimit,
          skip: paginateToFloor,
          sort: {
            [orderBy]: sortOrderBaseOnParameter[orderBy],
          },
        },
      );

      // console.log('Salvando urls usuario no Cache');

      await redisSetAsync(redisKeyUser, JSON.stringify(userUrls));

      const oneMinute = 60;

      const redisUserExpirationTimeInSeconds = oneMinute;

      redisExpireAsync(redisKeyUser, redisUserExpirationTimeInSeconds);

      const userUrlsFormated = userUrls.map(url => {
        return {
          id: url._id,
          alias: url.alias,
          url: url.url,
          createdAt: url.createdAt,
          updatedAt: url.updatedAt,
          publicStatus: url.publicStatus,
          domain: url.domain,
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

  async userToShortUrl(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals;
    let { alias, url, publicStatus } = req.body;
    const invalidPublicStatusType = typeof publicStatus !== 'boolean';

    if (invalidPublicStatusType) publicStatus = false;
    // if (!(typeof publicStatus === 'boolean')) publicStatus = false;

    url = checkProtocol(url);

    try {
      if (!alias) alias = 'undefined'; // criei apenas para passar no validator

      await userUrlSchema.validate({ alias, url, publicStatus, userId });

      if (alias === 'undefined') {
        // gera alias aleatorio se nao informado
        alias = await generateAlias(5);
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

      await redisHmsetAsync(['cached_alias', alias, url]);

      const newUrl = {
        alias,
        url,
        publicStatus,
        userId,
        createdAt: date,
        updatedAt: date,
        domain,
        number_access: 0,
      };

      // await urls.insert(newUrl);
      // salva url no banco assincronamente
      // pois já foi salva no cache
      urls.insert(newUrl);

      res.status(201).json({
        message: 'URL salva com sucesso!',
        urlcreated: {
          alias,
          url,
          publicStatus,
          date,
          domain,
          shorteredUrl: `${APP_HOST}/${alias}`,
        },
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  async userEditUrl(req: Request, res: Response, next: NextFunction) {
    // somente urls privadas podem ser editadas
    // pode-se editar alias e/ou url
    const { userId } = res.locals;
    let { alias, url, publicStatus, id } = req.body;

    url = checkProtocol(url);

    if (publicStatus) {
      throwErrorHandler(403, 'Somente urls privadas podem ser editadas.', next);

      return;
    }

    if (!userId) {
      // verificação de segurança
      throwErrorHandler(
        404,
        'Usuário não encontrado! Faça o login novamente.',
        next,
      );

      return;
    }

    try {
      if (!alias) alias = 'undefined';

      await userUrlSchema.validate({ alias, url, userId, publicStatus, id });

      if (alias === 'undefined') {
        // gera alias aleatorio se não informado
        alias = await generateAlias(5);
      }

      // const [userFounded, urlsFounded, aliasExisting] = await Promise.all([
      //   users.findOne({ _id: userId }),
      //   urls.find({ userId, publicStatus: false, _id: id.toString() }),
      //   urls.findOne({ alias }),
      // ]);

      // if (!userFounded) {
      //   // verificação de segurança
      //   throwErrorHandler(
      //     404,
      //     'Usuário não encontrado! Faça o login novamente.',
      //     next,
      //   );

      //   return;
      // }

      const [urlsFounded, aliasExisting] = await Promise.all([
        urls.find({ userId, publicStatus: false, _id: id.toString() }),
        urls.findOne({ alias }),
      ]);

      if (!urlsFounded[0]) {
        throwErrorHandler(
          404,
          'Alias não encontrado! Verifique o id do alias.',
          next,
        );

        return;
      }
      if (aliasExisting) {
        // este código verifica o alias informado pertence ao mesmoa alias
        //  que está sendo editado através do id do alias.
        // se for diferente, quer dizer que o apelido informado já existe e
        //  pertence a outro alias e portanto não pode ser usado na edicão.
        // se for "true", o nome do alias já exite e pertence a outra url.
        // se for "false", o nome do alias pertence ao proprio alias que está
        //  sendo editado.
        // é para o caso quando o usuário edita somente a url, mas mantem o
        //  nome do alias inalterado
        const aliasDoNotBelongsToTheCurrentAliasId = Boolean(
          urlsFounded[0]._id.toString().trim() !==
            aliasExisting._id.toString().trim(),
        );

        if (aliasDoNotBelongsToTheCurrentAliasId) {
          throwErrorHandler(
            403,
            'Apelido informado já existe! Informe outro apelido ou deixe-o em branco',
            next,
          );

          return;
        }
      }

      const date = new Date().toLocaleDateString('br');
      const domain = getDomain(url);

      // remove o valor antigo do cache
      await redisHdelAsync('cached_alias', urlsFounded[0].alias);

      // atualiza o cache
      await redisHmsetAsync(['cached_alias', alias, url]);

      const updatedUrl = await urls.findOneAndUpdate(
        { userId: userId, publicStatus: false, _id: id },
        {
          $set: {
            alias: alias,
            url,
            domain: domain,
            updatedAt: date,
          },
        },
      );

      res.status(200).json({
        message: 'Url editada com sucesso!',
        updatedurl: {
          alias: updatedUrl.alias,
          url: updatedUrl.url,
          domain: updatedUrl.domain,
          updatedAt: updatedUrl.updatedAt,
        },
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },
};

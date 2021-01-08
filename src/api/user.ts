import { Request, Response, NextFunction } from 'express';

import { db } from '@database/mongodb/mongodb-connection';

import { catchErrorFunction, throwErrorHandler } from '@utils/index';
import { getDomain, checkProtocol, generateAlias } from '@utils/index';
import {
  redisHmsetAsync,
  redisHdelAsync,
  redisGetAsync,
  redisSetAsync,
  redisExpireAsync,
} from '@utils/index';

import { applicationHost } from '@config/index';

const users = db.get('users');
const urls = db.get('urls');

export default {
  async userShowUrls(req: Request, res: Response, next: NextFunction) {
    const { userId, orderBy } = res.locals;

    const paginate = Number(req.query.page) ? Number(req.query.page) * 10 : 0;
    const paginateToFloor = Math.floor(paginate);
    const paginationLimit = 10;

    const sortOrderBaseOnParameter = {
      date: -1,
      alias: 1,
      number_access: -1,
      domain: 1,
    };

    try {
      const redisKeyUser = `user_${userId}_order-${orderBy}_page-${paginateToFloor}`;
      const cachedUserQuery = await redisGetAsync(redisKeyUser);

      if (cachedUserQuery) {
        // console.log('SERVINDO Urls usuario do Cache');
        const result = JSON.parse(cachedUserQuery);

        res.status(200).json({
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
          shorteredUrl: `${applicationHost}/${url.alias}`,
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
    const { userId, publicStatus } = res.locals;
    let { alias, url } = req.body;

    url = checkProtocol(url);

    try {
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
          shorteredUrl: `${applicationHost}/${alias}`,
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
      if (alias === 'undefined') {
        // gera alias aleatório, se não informado
        alias = await generateAlias(5);
      }

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

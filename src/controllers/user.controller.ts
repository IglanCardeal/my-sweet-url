import { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { nanoid } from 'nanoid';

import { db } from '@database/connection';
import { userUrlSchema } from '@utils/schemas';
import catchErrorFunction from '@utils/catch-error-function';
import throwErrorHandler from '@utils/throw-error-handler';
import getDomain from '@utils/get-domain';
import checkProtocol from '@utils/check-protocol';
import orderingUrls from '@utils/ordering-urls';

config();

const users = db.get('users');
const urls = db.get('urls');
const { APP_HOST } = process.env;

export default {
  async userShowUrls(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals;

    try {
      const userUrls = await orderingUrls(urls, req, userId);

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

    try {
      if (!alias) alias = nanoid(5);

      if (!(typeof publicStatus === 'boolean')) publicStatus = false;

      await userUrlSchema.validate({ alias, url, publicStatus, userId });

      alias = alias.toLowerCase();

      let aliasAlreadyExist;

      if (!alias) alias = nanoid(5);
      else aliasAlreadyExist = await urls.findOne({ alias });

      if (aliasAlreadyExist) {
        throwErrorHandler(
          403,
          'Apelido informado já existe! Tente outro nome.',
          next,
        );

        return;
      }

      const date = new Date().toLocaleDateString('br');
      const domain = getDomain(url);
      const urlWithProtocol = checkProtocol(url);

      const newUrl = {
        alias,
        url: urlWithProtocol,
        publicStatus,
        userId,
        createdAt: date,
        updatedAt: date,
        domain,
        number_access: 0,
      };

      await urls.insert(newUrl);

      res.status(201).json({
        message: 'URL salva com sucesso!',
        urlcreated: {
          alias,
          url: urlWithProtocol,
          publicStatus,
          date,
          domain,
          // shorteredUrl: `${APP_HOST}/user/url/${alias}`, // redirect padrao
          // para todos
          shorteredUrl: `${APP_HOST}/${alias}`,
        },
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },

  async userEditUrl(req: Request, res: Response, next: NextFunction) {
    const { userId } = res.locals;
    let { alias, url, publicStatus, id } = req.body;

    // somente urls privadas podem ser editadas
    if (publicStatus) {
      throwErrorHandler(403, 'Somente urls privadas podem ser editadas.', next);
    }

    try {
      if (!alias) alias = nanoid(5);

      await userUrlSchema.validate({ alias, url, userId, publicStatus });

      const [userFounded, urlsFounded, aliasAlreadyExist] = await Promise.all([
        users.findOne({ _id: userId }),
        urls.find({ userId, publicStatus: false, _id: id }),
        urls.findOne({ alias }),
      ]);

      if (!userFounded) {
        throwErrorHandler(
          404,
          'Usuário não encontrado! Faça o login novamente.',
          next,
        );

        return;
      }

      if (!urlsFounded) {
        throwErrorHandler(404, 'Url não encontrada!', next);
      }

      if (aliasAlreadyExist) {
        throwErrorHandler(
          403,
          'Apelido informado já existe! Informe outro apelido ou deixe-o em branco',
          next,
        );

        return;
      }

      const date = new Date().toLocaleDateString('br');
      const domain = getDomain(url);
      const urlWithProtocol = checkProtocol(url);

      const updatedUrl = await urls.findOneAndUpdate(
        { userId: userId },
        {
          $set: {
            alias: alias,
            url: urlWithProtocol,
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

  // async userRedirectUrl(req: Request, res: Response, next: NextFunction) {
  //   const { alias } = req.params;

  //   try {
  //     const url = await urls.findOne({ alias });

  //     if (!url?.url) {
  //       return res.sendFile(path.join(__dirname, '../public', '404.html'));
  //     }

  //     const number_access = url.number_access + 1;

  //     urls.findOneAndUpdate(
  //       { alias },
  //       {
  //         $set: {
  //           number_access: number_access,
  //         },
  //       },
  //     );

  //     res.status(308).redirect(url.url);
  //   } catch (error) {
  //     catchErrorFunction(error, next);
  //   }
  // },
};

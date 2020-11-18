import { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { nanoid } from 'nanoid';

import { db } from '@database/connection';
import { urlSchema } from '@utils/schemas';
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
          alias: url.alias,
          url: url.url,
          date: url.date,
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
        throwErrorHandler(
          403,
          'Apelido informado já existe! Tente outro nome.',
        );
      }

      const date = new Date().toLocaleDateString('br');
      const domain = getDomain(url);
      const urlWithProtocol = checkProtocol(url);

      const newUrl = {
        alias,
        url: urlWithProtocol,
        publicStatus,
        userId,
        date,
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
    const { alias, url, publicStatus } = req.body;

    try {
      await urlSchema.validate({ alias, url, userId, publicStatus });

      const [userFounded, urlsFounded] = await Promise.all([
        users.findOne({ _id: userId }),
        urls.find({ userId, alias, url }),
      ]);

      if (!userFounded) {
        throwErrorHandler(
          404,
          'Usuário não encontrado! Faça o login novamente.',
        );
      }

      if (!urlsFounded) {
        throwErrorHandler(404, 'Url não encontrada!');
      }

      const domain = getDomain(url);
      const urlWithProtocol = checkProtocol(url);

      const updatedUrl = await urls.findOneAndUpdate(
        { userId: userId },
        { $set: { alias: alias, url: urlWithProtocol, domain: domain } },
      );

      res.status(200).json({
        message: 'Url editada com sucesso!',
        updatedurl: {
          alias: updatedUrl.alias,
          url: updatedUrl.url,
          domain: updatedUrl.domain,
        },
      });
    } catch (error) {
      catchErrorFunction(error, next);
    }
  },
};

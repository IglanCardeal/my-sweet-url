import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import * as yup from 'yup';

import { db } from '../database/connection';

const urls = db.get('urls');
const users = db.get('users');

urls.createIndex('alias');

// definindo o formato dos parametros antes
// de salvar no banco
const urlSchema = yup.object().shape({
  alias: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

export default {
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

  async toShortUrl(req: Request, res: Response, next: NextFunction) {
    let { alias, url } = req.body;

    if (url === '') {
      res.status(400).json({ message: 'URL nao pode ser vazia!' });
    }

    try {
      if (!alias) alias = nanoid(7);

      await urlSchema.validate({ alias, url });

      const aliasExist = await urls.findOne({ alias });

      if (aliasExist) {
        const error = {
          message: 'Apelido informado ja existe! Tente outro nome.',
          statusCode: 403,
        };

        throw error;
      }
      alias = alias.toLowerCase();

      const newUrl = {
        alias,
        url,
      };

      const shortUrlCreated = await urls.insert(newUrl);

      res
        .status(200)
        .json({ message: 'Nova URL adicionada com sucesso.', shortUrlCreated });
    } catch (error) {
      if (error.errors?.length > 0) {
        error = {
          message:
            'Formato do apelido invalido. Use somente letras, numeros, "_" ou "-".',
          statusCode: 403,
        };

        return next(error);
      }

      console.log(error);
      return next(error);
    }
  },
};

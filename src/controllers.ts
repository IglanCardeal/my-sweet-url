import { Request, Response, NextFunction } from 'express';
import monk from 'monk';
import * as yup from 'yup';

import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

dotenv.config();

const DB_URL = String(process.env.DB_URI);

const db = monk(DB_URL);

const urls = db.get('urls');

urls.createIndex('name'); // criando uma indexe para melhor performance nas queries

// definindo o formato dos parametros antes
// de salvar no banco
const schema = yup.object().shape({
  alias: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

export default {
  redirectToUrl(req: Request, res: Response) {
    const id = req.params.id;
  },

  async toShortUrl(req: Request, res: Response, next: NextFunction) {
    let { alias, url } = req.body;

    if (url === '') {
      res.status(400).json({ message: 'URL nao pode ser vazia!' });
    }

    try {
      await schema.validate({ alias, url });

      if (!alias) alias = nanoid(7);

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
      return next(error);
    }
  },
};

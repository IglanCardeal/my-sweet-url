import { Request, Response, NextFunction } from 'express';

import { catchErrorFunction, throwErrorHandler } from '@utils/index';

import {
  domainValidator,
  urlToFilter,
  aliasValidator,
  urlSchema,
} from '@schemas/index';

export const publicShowFilteredUrlsValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let findBy = req.query.findby?.toString().trim() || '';

  const value = req.query.value?.toString().trim();
  const findByArray = ['alias', 'domain'];
  const invalidFindByValue = findByArray.indexOf(findBy) < 0;

  if (invalidFindByValue) {
    throwErrorHandler(
      403,
      'Campo de busca inválido. Somente apelido (alias) ou dominio (domain) são aceitos no filtro.',
      next,
    );

    return;
  }

  try {
    if (findBy === 'domain') await domainValidator.validate({ domain: value });
    else await urlToFilter.validate({ alias: value });

    next();
  } catch (error) {
    catchErrorFunction(error, next);
  }
};

export const publicRedirectToUrlValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { alias } = req.params;

  try {
    await aliasValidator.validate({ alias });

    next();
  } catch (error) {
    catchErrorFunction(error, next);
  }
};

export const publicToShortUrlValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { alias, url } = req.body;
  // valores padrao para cadastro anonimo
  let publicStatus = true;
  let userId = '0';

  try {
    if (!alias) alias = 'undefined'; // criei apenas para passar no validator

    await urlSchema.validate({ alias, url, publicStatus, userId });

    next();
  } catch (error) {
    catchErrorFunction(error, next);
  }
};

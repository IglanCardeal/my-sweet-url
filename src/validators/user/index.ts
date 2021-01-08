import { Request, Response, NextFunction } from 'express';

import { catchErrorFunction, throwErrorHandler } from '@utils/index';

import { userUrlSchema } from '@schemas/index';

export const userShowUrlsValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let orderBy = req.query.orderby?.toString().trim() || '';

  const orderByArray = ['alias', 'date', 'number_access', 'domain'];
  const indexOfOrderBy = orderByArray.indexOf(orderBy);
  const invalidOrderByValue = Boolean(indexOfOrderBy < 0);

  if (invalidOrderByValue) orderBy = 'alias';

  res.locals.orderBy = orderBy;

  next();
};

export const userToShortUrlValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = res.locals;

  let { alias, url, publicStatus } = req.body;

  const invalidPublicStatusType = typeof publicStatus !== 'boolean';

  if (invalidPublicStatusType) publicStatus = false;

  try {
    if (!alias) alias = 'undefined'; // criei apenas para passar no validator

    await userUrlSchema.validate({ alias, url, publicStatus, userId });

    res.locals.publicStatus = publicStatus;

    next();
  } catch (error) {
    catchErrorFunction(error, next);
  }
};

export const userEditUrlValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // somente urls privadas podem ser editadas
  // pode-se editar alias e/ou url
  const { userId } = res.locals;
  let { alias, url, publicStatus, id } = req.body;

  if (publicStatus) {
    throwErrorHandler(403, 'Somente urls privadas podem ser editadas.', next);

    return;
  }

  try {
    if (!alias) alias = 'undefined';

    await userUrlSchema.validate({ alias, url, userId, publicStatus, id });

    next();
  } catch (error) {
    catchErrorFunction(error, next);
  }
};

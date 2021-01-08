import { NextFunction } from 'express';

export const catchErrorFunction = (error: any, next: NextFunction) => {
  if (error.errors?.length > 0) {
    console.log(error);
    const message = error.errors[0];

    error = {
      message,
      statusCode: 403,
    };

    next(error);

    return;
  }

  next(error);

  return;
};

export const throwErrorHandler = (
  statusCode: number = 500,
  message: string = 'Erro interno de servidor',
  next: NextFunction,
) => {
  const error = {
    statusCode: statusCode,
    message: message,
  };

  next(error);
};

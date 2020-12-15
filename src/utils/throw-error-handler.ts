import { NextFunction } from 'express';

const throwErrorHandler = (
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

export default throwErrorHandler;

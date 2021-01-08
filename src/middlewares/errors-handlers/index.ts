import { Request, Response, NextFunction } from 'express';

interface HttpException {
  message: string;
  statusCode: number;
}

export const errorHandler = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // console.log(error);

  if (error.statusCode) {
    res.status(error.statusCode).json({ message: error.message });
  } else {
    res.status(500).json({
      message: '500 - Erro interno de servidor. Desculpe pelo o ocorrido :/',
    });
  }
};

export const notFoundHandler = async (req: Request, res: Response) => {
  res.status(404).json({
    message:
      '404 - Recurso não encontrado. Verifique método e/ou url da chamada.',
  });
};

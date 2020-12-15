import { Request, Response, NextFunction } from 'express';

interface HttpException {
  message: string;
  statusCode: number;
}

export default (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(error);

  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  } else {
    return res.status(500).json({
      message: '500 - Erro interno de servidor. Desculpe pelo o ocorrido :/',
    });
  }
};

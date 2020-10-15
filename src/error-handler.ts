import { Request, Response, NextFunction } from 'express';

interface HttpException {
  message: string;
  statusCode: number;
}

export default (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(error);
  res.status(error.statusCode).json({ message: error.message });
};

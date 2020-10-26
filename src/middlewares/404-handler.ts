import { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
  res.status(404).json({
    message:
      '404 - Recurso nao encontrado. Verifique metodo e/ou path da chamada.',
  });
};

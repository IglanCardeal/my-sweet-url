import { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
  res.status(404).json({
    message:
      '404 - Recurso não encontrado. Verifique método e/ou url da chamada.',
  });
};

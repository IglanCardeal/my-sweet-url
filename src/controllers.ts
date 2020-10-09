import { Request, Response } from 'express';
import monk from 'monk';

import dotenv from 'dotenv';

dotenv.config();

const DB_URL = process.env.DB_URL;

export default {
  redirectToUrl(req: Request, res: Response) {
    const id = req.params.id;
  },
};

import { Request } from 'express';

export default (req: Request) => {
  return req.cookies['Authorization'];
};

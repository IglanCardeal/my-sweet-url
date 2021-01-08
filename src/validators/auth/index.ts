import { Request, Response, NextFunction } from 'express';

import { catchErrorFunction } from '@utils/index';

import { userLoginSchema, userSignupSchema } from '@schemas/index';

export const loginValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { username, password } = req.body;

  try {
    await userLoginSchema.validate({ username, password });

    next();
  } catch (error) {
    catchErrorFunction(error, next);
  }
};

export const signupValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { email, username, password } = req.body;

  email = email.trim();
  username = username.trim().toLowerCase();
  password = password.trim();

  try {
    await userSignupSchema.validate({ email, username, password });

    next();
  } catch (error) {
    catchErrorFunction(error, next);
  }
};

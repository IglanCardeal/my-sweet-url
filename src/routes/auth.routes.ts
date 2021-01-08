import { Router } from 'express';

import signupLoginControllers from '@api/auth';

import {
  logoutApiLimit,
  signupApiLimit,
  loginApiLimit,
  slowBruteForce,
} from '@middlewares/rate-limiters';

import { loginValidator, signupValidator } from '@validators/auth';

const router = Router();

router.post(
  '/api/login',
  slowBruteForce,
  loginApiLimit,
  loginValidator,
  signupLoginControllers.login,
);
router.post(
  '/api/signup',
  signupApiLimit,
  signupValidator,
  signupLoginControllers.signup,
);
router.delete('/api/logout', logoutApiLimit, signupLoginControllers.logout);

export default router;

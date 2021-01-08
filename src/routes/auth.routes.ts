import { Router } from 'express';

import signupLoginControllers from '@api/auth';

import {
  logoutApiLimit,
  signupApiLimit,
  loginApiLimit,
  slowBruteForce,
} from '@middlewares/rate-limiters';

const router = Router();

router.post(
  '/api/login',
  slowBruteForce,
  loginApiLimit,
  signupLoginControllers.login,
);
router.post('/api/signup', signupApiLimit, signupLoginControllers.signup);
router.delete('/api/logout', logoutApiLimit, signupLoginControllers.logout);

export default router;

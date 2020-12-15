import { Router } from 'express';

import signupLoginControllers from '@controllers/signup-login.controllers';

import apiRateLimiter from '@middlewares/api-rate-limit';

const router = Router();

router.post(
  '/api/login',
  apiRateLimiter.userLoginApiLimit,
  signupLoginControllers.login,
);
router.post('/api/signup', signupLoginControllers.signup);
router.delete('/api/logout', signupLoginControllers.logout);

export default router;

import { Router } from 'express';

import signupLoginControllers from '@controllers/signup-login.controllers';

// rate limiter
import slowBruteForce from '@middlewares/rate-limiter/slow-brute-force';
import userLoginApiLimit from '@middlewares/rate-limiter/login-rate-limit';
import userLogoutApiLimit from '@middlewares/rate-limiter/logout-rate-limit';
import signupApiLimit from '@middlewares/rate-limiter/signup-rate-limit';

const router = Router();

router.post(
  '/api/login',
  slowBruteForce,
  userLoginApiLimit,
  signupLoginControllers.login,
);
router.post('/api/signup', signupApiLimit, signupLoginControllers.signup);
router.delete(
  '/api/logout',
  userLogoutApiLimit,
  signupLoginControllers.logout,
);

export default router;

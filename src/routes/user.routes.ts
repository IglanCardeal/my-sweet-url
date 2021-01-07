import { Router } from 'express';

import userControllers from '@api/user.controller';

import checkAuthentication from '@middlewares/check-authentication';
import userRateLimiter from '@middlewares/rate-limiter/user-rate-limit';
import slowBruteForce from '@middlewares/rate-limiter/slow-brute-force';

const router = Router();

router.get(
  '/api/users/urls',
  slowBruteForce,
  checkAuthentication,
  userRateLimiter,
  userControllers.userShowUrls,
);
router.post(
  '/api/users/urls/create',
  slowBruteForce,
  checkAuthentication,
  userRateLimiter,
  userControllers.userToShortUrl,
);
router.patch(
  '/api/users/urls/edit',
  slowBruteForce,
  checkAuthentication,
  userRateLimiter,
  userControllers.userEditUrl,
);

export default router;

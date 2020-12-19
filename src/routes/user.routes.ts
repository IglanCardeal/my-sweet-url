import { Router } from 'express';

import userControllers from '@controllers/user.controller';

import checkAuthentication from '@middlewares/check-authentication';
import apiRateLimiter from '@middlewares/rate-limiter/login-rate-limit';

const router = Router();

router.get(
  '/api/users/urls',
  checkAuthentication,
  userControllers.userShowUrls,
);
router.post(
  '/api/users/urls/create',
  checkAuthentication,
  userControllers.userToShortUrl,
);
router.patch(
  '/api/users/urls/edit',
  checkAuthentication,
  userControllers.userEditUrl,
);

export default router;

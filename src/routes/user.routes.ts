import { Router } from 'express';

import userControllers from '@api/user';

import checkAuthentication from '@middlewares/auth';

import {
  userRequestApiLimit,
  slowBruteForce,
} from '@middlewares/rate-limiters';

const router = Router();

router.get(
  '/api/users/urls',
  slowBruteForce,
  checkAuthentication,
  userRequestApiLimit,
  userControllers.userShowUrls,
);
router.post(
  '/api/users/urls/create',
  slowBruteForce,
  checkAuthentication,
  userRequestApiLimit,
  userControllers.userToShortUrl,
);
router.patch(
  '/api/users/urls/edit',
  slowBruteForce,
  checkAuthentication,
  userRequestApiLimit,
  userControllers.userEditUrl,
);

export default router;

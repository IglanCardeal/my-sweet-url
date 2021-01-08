import { Router } from 'express';

import userControllers from '@api/user';

import checkAuthentication from '@middlewares/auth';

import {
  userRequestApiLimit,
  slowBruteForce,
} from '@middlewares/rate-limiters';

import {
  userShowUrlsValidator,
  userToShortUrlValidator,
  userEditUrlValidator
} from '@validators/user';

const router = Router();

router.get(
  '/api/users/urls',
  slowBruteForce,
  checkAuthentication,
  userRequestApiLimit,
  userShowUrlsValidator,
  userControllers.userShowUrls,
);
router.post(
  '/api/users/urls/create',
  slowBruteForce,
  checkAuthentication,
  userRequestApiLimit,
  userToShortUrlValidator,
  userControllers.userToShortUrl,
);
router.patch(
  '/api/users/urls/edit',
  slowBruteForce,
  checkAuthentication,
  userRequestApiLimit,
  userEditUrlValidator,
  userControllers.userEditUrl,
);

export default router;

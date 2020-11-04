import { Router } from 'express';

import urlControllers from '../controllers/url.controllers';
import userControllers from '../controllers/user.controller';

import checkAuthentication from '../middlewares/check-authentication';

const router = Router();

// PUBLIC routes
router.get('/show-urls', urlControllers.publicShowUrls);
router.post(
  '/show-filtered-public-urls',
  urlControllers.publicShowFilteredUrls,
);
router.get('/url/:alias', urlControllers.publicRedirectToUrl);
router.post('/short-url', urlControllers.publicToShortUrl);

// USERS routes
router.post('/login', userControllers.login);
router.post('/signup', userControllers.signup);
router.get('/user/urls', checkAuthentication, userControllers.userShowUrls);
router.get('/user/url/:alias', userControllers.userRedirectUrl);
router.post(
  '/user/short-url',
  checkAuthentication,
  userControllers.userToShortUrl,
);
router.put('/user/edit', checkAuthentication, userControllers.userEditUrl);

export default router;

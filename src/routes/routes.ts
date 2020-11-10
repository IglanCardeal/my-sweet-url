import { Router } from 'express';

import urlControllers from '../controllers/url.controllers';
import userControllers from '../controllers/user.controller';
import signupLoginControllers from '../controllers/signupLogin.controllers';

import checkAuthentication from '../middlewares/check-authentication';

const router = Router();

// PUBLIC routes
router.get('/urls', urlControllers.publicShowUrls);
router.post('/urls/filtered', urlControllers.publicShowFilteredUrls);
router.get('/urls/:alias', urlControllers.publicRedirectToUrl);
router.post('/urls/create', urlControllers.publicToShortUrl);

// SIGNUP/LOGIN routes
router.post('/login', signupLoginControllers.login);
router.post('/signup', signupLoginControllers.signup);

// USERS routes
router.get('/user/urls', checkAuthentication, userControllers.userShowUrls);
router.get('/user/url/:alias', userControllers.userRedirectUrl);
router.post(
  '/user/short-url',
  checkAuthentication,
  userControllers.userToShortUrl,
);
router.put('/user/edit', checkAuthentication, userControllers.userEditUrl);

export default router;

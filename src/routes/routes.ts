import { Router } from 'express';

import urlControllers from '@controllers/url.controllers';
import userControllers from '@controllers/user.controller';
import signupLoginControllers from '@controllers/signupLogin.controllers';

import checkAuthentication from '@middlewares/check-authentication';

const router = Router();

// PUBLIC routes
// router.get('/urls/:alias', urlControllers.publicRedirectToUrl);
router.get('/urls', urlControllers.publicShowUrls);
router.get('/:alias', urlControllers.publicRedirectToUrl);
router.post('/urls/filtered', urlControllers.publicShowFilteredUrls);
router.post('/urls/create', urlControllers.publicToShortUrl);

// SIGNUP/LOGIN/LOGOUT routes
router.post('/login', signupLoginControllers.login);
router.post('/signup', signupLoginControllers.signup);
router.delete('/logout', signupLoginControllers.logout);

// USERS routes
router.get('/users/urls', checkAuthentication, userControllers.userShowUrls);
// router.get('/users/urls/:alias', userControllers.userRedirectUrl);
router.post(
  '/users/urls/create',
  checkAuthentication,
  userControllers.userToShortUrl,
);
router.put(
  '/users/urls/edit',
  checkAuthentication,
  userControllers.userEditUrl,
);

export default router;

import { Router } from 'express';

import urlControllers from '@controllers/url.controllers';
import userControllers from '@controllers/user.controller';
import signupLoginControllers from '@controllers/signupLogin.controllers';

import checkAuthentication from '@middlewares/check-authentication';

const router = Router();

// PUBLIC routes
// router.get('/urls/:alias', urlControllers.publicRedirectToUrl);
router.get('/:alias', urlControllers.publicRedirectToUrl);
router.get('/api/urls', urlControllers.publicShowUrls);
router.post('/api/urls/filtered', urlControllers.publicShowFilteredUrls);
router.post('/api/urls/create', urlControllers.publicToShortUrl);

// SIGNUP/LOGIN/LOGOUT routes
router.post('/api/login', signupLoginControllers.login);
router.post('/api/signup', signupLoginControllers.signup);
router.delete('/api/logout', signupLoginControllers.logout);

// USERS routes
router.get(
  '/api/users/urls',
  checkAuthentication,
  userControllers.userShowUrls,
);
// router.get('/api/users/urls/:alias', userControllers.userRedirectUrl);
router.post(
  '/api/users/urls/create',
  checkAuthentication,
  userControllers.userToShortUrl,
);
router.put(
  '/api/users/urls/edit',
  checkAuthentication,
  userControllers.userEditUrl,
);

export default router;

import { Router } from 'express';
import path from 'path';

import urlControllers from '../controllers/url.controllers';
import userControllers from '../controllers/user.controller';

const router = Router();

router.get('/show-urls', urlControllers.showPublicUrls);

router.post(
  '/show-filtered-public-urls',
  urlControllers.showFilteredPublicUrls,
);

router.get('/url/:alias', urlControllers.redirectToUrl);

router.post('/short-url', urlControllers.toShortUrlAnonymous);

// USERS routes
router.post('/login', userControllers.login)

export default router;

import { Router } from 'express';
import path from 'path';

import urlControllers from '../controllers/url.controllers';
import userControllers from '../controllers/user.controller';

const router = Router();

router.get('/showurls', urlControllers.showPublicUrls);

router.get('/url/:id', urlControllers.redirectToUrl);

router.post('/shorturl', urlControllers.toShortUrlAnonymous);

export default router;

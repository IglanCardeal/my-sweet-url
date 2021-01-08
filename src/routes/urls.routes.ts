import { Router } from 'express';

import urlControllers from '@api/urls';

import { publicRequestApiLimit } from '@middlewares/rate-limiters';

const router = Router();

router.get(
  '/:alias',
  publicRequestApiLimit,
  urlControllers.publicRedirectToUrl,
);
router.get('/api/urls', publicRequestApiLimit, urlControllers.publicShowUrls);
router.get(
  '/api/urls/filtered',
  publicRequestApiLimit,
  urlControllers.publicShowFilteredUrls,
);
router.post(
  '/api/urls/create',
  publicRequestApiLimit,
  urlControllers.publicToShortUrl,
);

export default router;

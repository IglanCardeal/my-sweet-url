import { Router } from 'express';

import urlControllers from '@api/urls';

import { publicRequestApiLimit } from '@middlewares/rate-limiters';

import {
  publicShowFilteredUrlsValidator,
  publicRedirectToUrlValidator,
  publicToShortUrlValidator
} from '@validators/urls';

const router = Router();

router.get(
  '/:alias',
  publicRequestApiLimit,
  publicRedirectToUrlValidator,
  urlControllers.publicRedirectToUrl,
);
router.get('/api/urls', publicRequestApiLimit, urlControllers.publicShowUrls);
router.get(
  '/api/urls/filtered',
  publicRequestApiLimit,
  publicShowFilteredUrlsValidator,
  urlControllers.publicShowFilteredUrls,
);
router.post(
  '/api/urls/create',
  publicRequestApiLimit,
  publicToShortUrlValidator,
  urlControllers.publicToShortUrl,
);

export default router;

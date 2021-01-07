import { Router } from 'express';

import urlControllers from '@api/url.controllers';

import publicSlowBruteForce from '@middlewares/rate-limiter/public-rate-limit';

const router = Router();

router.get('/:alias', publicSlowBruteForce, urlControllers.publicRedirectToUrl);
router.get('/api/urls', publicSlowBruteForce, urlControllers.publicShowUrls);
router.get(
  '/api/urls/filtered',
  publicSlowBruteForce,
  urlControllers.publicShowFilteredUrls,
);
router.post(
  '/api/urls/create',
  publicSlowBruteForce,
  urlControllers.publicToShortUrl,
);

export default router;

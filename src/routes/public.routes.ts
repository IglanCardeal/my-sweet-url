import { Router } from 'express';

import urlControllers from '@controllers/url.controllers';

const router = Router();

router.get('/:alias', urlControllers.publicRedirectToUrl);
router.get('/api/urls', urlControllers.publicShowUrls);
router.get('/api/urls/filtered', urlControllers.publicShowFilteredUrls);
router.post('/api/urls/create', urlControllers.publicToShortUrl);

export default router;

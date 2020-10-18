import { Router } from 'express';
import controllers from '../controllers/controllers';
import path from 'path';

const router = Router();

router.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/:id', controllers.redirectToUrl);

router.post('/url', controllers.toShortUrl);

router.get('/url/:id', controllers.redirectToUrl);

export default router;

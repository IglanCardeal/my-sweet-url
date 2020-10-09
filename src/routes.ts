import { Router } from 'express';
import controllers from './controllers';
import path from 'path';

const router = Router();

router.get('/', (req, res) => {
  // res.status(200).json({ message: "Working!" });
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

router.get('/:id', controllers.redirectToUrl);

router.post('/url', controllers.redirectToUrl);

router.get('/url/:id', controllers.redirectToUrl);

export default router;

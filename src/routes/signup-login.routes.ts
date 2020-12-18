import { Router } from 'express';

import signupLoginControllers from '@controllers/signup-login.controllers';
import loginRateLimit from '@middlewares/rate-limit/login-rate-limit'

const router = Router();

router.post(
  '/api/login',
  loginRateLimit.userLoginApiLimit,
  signupLoginControllers.login,
);
router.post('/api/signup', signupLoginControllers.signup);
router.delete('/api/logout', signupLoginControllers.logout);

export default router;

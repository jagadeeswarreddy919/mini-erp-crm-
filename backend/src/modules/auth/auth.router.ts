import { Router } from 'express';
import * as authController from './auth.controller';
import { loginSchema } from './auth.schema';
import { validateRequest } from '../../middleware/validate';
import { authenticateUser } from '../../middleware/auth';

const router = Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', authenticateUser, authController.getMe);

export default router;

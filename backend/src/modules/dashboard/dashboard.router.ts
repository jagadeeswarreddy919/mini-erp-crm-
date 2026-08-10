import { Router } from 'express';
import * as dashboardController from './dashboard.controller';
import { authenticateUser } from '../../middleware/auth';
import { requireRole } from '../../middleware/authorize';

const router = Router();

router.use(authenticateUser);

router.get('/summary', requireRole(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), dashboardController.getSummary);

export default router;

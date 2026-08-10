import { Router } from 'express';
import * as inventoryController from './inventory.controller';
import { adjustStockSchema } from './inventory.schema';
import { validateRequest } from '../../middleware/validate';
import { authenticateUser } from '../../middleware/auth';
import { requireRole } from '../../middleware/authorize';

const router = Router();

router.use(authenticateUser);

router.get('/', requireRole(['ADMIN', 'WAREHOUSE', 'ACCOUNTS', 'SALES']), inventoryController.getSummary);
router.get('/movements', requireRole(['ADMIN', 'WAREHOUSE', 'ACCOUNTS', 'SALES']), inventoryController.listMovements);

router.post(
  '/adjust',
  requireRole(['ADMIN', 'WAREHOUSE']),
  validateRequest(adjustStockSchema),
  inventoryController.adjustStock
);

export default router;

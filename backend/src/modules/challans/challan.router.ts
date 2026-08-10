import { Router } from 'express';
import * as challanController from './challan.controller';
import { createChallanSchema, updateChallanSchema } from './challan.schema';
import { validateRequest } from '../../middleware/validate';
import { authenticateUser } from '../../middleware/auth';
import { requireRole } from '../../middleware/authorize';

const router = Router();

router.use(authenticateUser);

router.get('/', requireRole(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), challanController.listChallans);
router.get('/:id', requireRole(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), challanController.getChallan);

router.post(
  '/',
  requireRole(['ADMIN', 'SALES']),
  validateRequest(createChallanSchema),
  challanController.createChallan
);

router.put(
  '/:id',
  requireRole(['ADMIN', 'SALES']),
  validateRequest(updateChallanSchema),
  challanController.updateChallan
);

router.post('/:id/confirm', requireRole(['ADMIN', 'SALES', 'ACCOUNTS']), challanController.confirmChallan);
router.post('/:id/cancel', requireRole(['ADMIN', 'SALES', 'ACCOUNTS']), challanController.cancelChallan);

export default router;

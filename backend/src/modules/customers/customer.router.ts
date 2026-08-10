import { Router } from 'express';
import * as customerController from './customer.controller';
import { createCustomerSchema, updateCustomerSchema, addFollowUpSchema } from './customer.schema';
import { validateRequest } from '../../middleware/validate';
import { authenticateUser } from '../../middleware/auth';
import { requireRole } from '../../middleware/authorize';

const router = Router();

router.use(authenticateUser);

router.get('/', requireRole(['ADMIN', 'SALES', 'ACCOUNTS']), customerController.listCustomers);
router.get('/:id', requireRole(['ADMIN', 'SALES', 'ACCOUNTS']), customerController.getCustomer);

router.post(
  '/',
  requireRole(['ADMIN', 'SALES']),
  validateRequest(createCustomerSchema),
  customerController.createCustomer
);

router.put(
  '/:id',
  requireRole(['ADMIN', 'SALES']),
  validateRequest(updateCustomerSchema),
  customerController.updateCustomer
);

router.delete('/:id', requireRole(['ADMIN']), customerController.deleteCustomer);

router.post(
  '/:id/follow-ups',
  requireRole(['ADMIN', 'SALES']),
  validateRequest(addFollowUpSchema),
  customerController.addFollowUp
);

router.get('/:id/follow-ups', requireRole(['ADMIN', 'SALES']), customerController.getFollowUps);

export default router;

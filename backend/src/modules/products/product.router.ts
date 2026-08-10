import { Router } from 'express';
import * as productController from './product.controller';
import { createProductSchema, updateProductSchema } from './product.schema';
import { validateRequest } from '../../middleware/validate';
import { authenticateUser } from '../../middleware/auth';
import { requireRole } from '../../middleware/authorize';

const router = Router();

router.use(authenticateUser);

router.get('/', requireRole(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), productController.listProducts);
router.get('/categories', requireRole(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), productController.getCategories);
router.get('/:id', requireRole(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), productController.getProduct);

router.post(
  '/',
  requireRole(['ADMIN', 'WAREHOUSE']),
  validateRequest(createProductSchema),
  productController.createProduct
);

router.put(
  '/:id',
  requireRole(['ADMIN', 'WAREHOUSE']),
  validateRequest(updateProductSchema),
  productController.updateProduct
);

router.delete('/:id', requireRole(['ADMIN']), productController.deleteProduct);

export default router;

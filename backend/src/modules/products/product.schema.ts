import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name is required'),
    sku: z.string().min(2, 'SKU code is required'),
    category: z.string().min(2, 'Category is required'),
    unitPrice: z.number().min(0, 'Unit price must be 0 or greater'),
    currentStock: z.number().int().min(0, 'Current stock must be 0 or greater'),
    minStockAlert: z.number().int().min(0, 'Minimum stock alert must be 0 or greater').default(10),
    warehouseLocation: z.string().min(1, 'Warehouse location is required'),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Product ID'),
  }),
  body: createProductSchema.shape.body.partial(),
});

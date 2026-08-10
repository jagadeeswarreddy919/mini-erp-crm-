import { z } from 'zod';

const challanItemInputSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative').optional(),
});

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid Customer ID'),
    items: z.array(challanItemInputSchema).min(1, 'Challan must contain at least one item'),
  }),
});

export const updateChallanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Challan ID'),
  }),
  body: z.object({
    customerId: z.string().uuid('Invalid Customer ID').optional(),
    items: z.array(challanItemInputSchema).min(1, 'Challan must contain at least one item').optional(),
  }),
});

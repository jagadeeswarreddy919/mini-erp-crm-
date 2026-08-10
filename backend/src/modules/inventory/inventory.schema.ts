import { z } from 'zod';

export const adjustStockSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().min(1, 'Quantity must be greater than 0'),
    type: z.enum(['IN', 'OUT'], {
      errorMap: () => ({ message: 'Movement type must be IN or OUT' }),
    }),
    reason: z.string().min(3, 'Reason for stock movement is required'),
  }),
});

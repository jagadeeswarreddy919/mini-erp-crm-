import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Customer name must be at least 2 characters'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    businessName: z.string().min(2, 'Business name is required'),
    gstNumber: z.string().optional().or(z.literal('')),
    customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'], {
      errorMap: () => ({ message: 'Type must be RETAIL, WHOLESALE, or DISTRIBUTOR' }),
    }),
    address: z.string().min(3, 'Address is required'),
    status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('ACTIVE'),
    followUpDate: z.string().optional().or(z.literal('')),
    notes: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Customer ID'),
  }),
  body: createCustomerSchema.shape.body.partial(),
});

export const addFollowUpSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Customer ID'),
  }),
  body: z.object({
    note: z.string().min(3, 'Follow-up note cannot be empty'),
    followUpDate: z.string().optional().or(z.literal('')),
  }),
});

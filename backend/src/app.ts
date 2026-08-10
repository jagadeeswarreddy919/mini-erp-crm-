import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRouter from './modules/auth/auth.router';
import customerRouter from './modules/customers/customer.router';
import productRouter from './modules/products/product.router';
import inventoryRouter from './modules/inventory/inventory.router';
import challanRouter from './modules/challans/challan.router';
import dashboardRouter from './modules/dashboard/dashboard.router';
import teamMembersRouter from './modules/team-members/team-members.router';
import { globalErrorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/errors';

const app: Application = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'Mini ERP + CRM Operations Portal',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/customers', customerRouter);
app.use('/api/products', productRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/challans', challanRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/team-members', teamMembersRouter);

// Handle 404
app.use('*', (_req, _res, next) => {
  next(new NotFoundError('API endpoint not found'));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;

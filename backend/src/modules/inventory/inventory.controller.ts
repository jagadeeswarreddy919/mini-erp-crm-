import { Response, NextFunction } from 'express';
import * as inventoryService from './inventory.service';
import { sendSuccess } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../../middleware/auth';

export const getSummary = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const summary = await inventoryService.getInventorySummary();
    return sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};

export const listMovements = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, type, search, startDate, endDate, page, limit } = req.query;
    const result = await inventoryService.getStockMovements({
      productId: productId as string,
      type: type as any,
      search: search as string,
      startDate: startDate as string,
      endDate: endDate as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { productId, quantity, type, reason } = req.body;
    const movement = await inventoryService.adjustStock(productId, quantity, type, reason, userId);
    return sendSuccess(res, movement, 201);
  } catch (error) {
    next(error);
  }
};

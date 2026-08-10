import { Response, NextFunction } from 'express';
import * as dashboardService from './dashboard.service';
import { sendSuccess } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../../middleware/auth';

export const getSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role || 'ADMIN';
    const userId = req.user?.userId || '';
    const summary = await dashboardService.getDashboardSummaryForUser(userRole, userId);
    return sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};

import { Response, NextFunction } from 'express';
import * as challanService from './challan.service';
import { sendSuccess } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../../middleware/auth';

export const listChallans = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, status, customerId, startDate, endDate, page, limit } = req.query;
    const result = await challanService.getChallans({
      search: search as string,
      status: status as string,
      customerId: customerId as string,
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

export const getChallan = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const challan = await challanService.getChallanById(req.params.id);
    return sendSuccess(res, challan);
  } catch (error) {
    next(error);
  }
};

export const createChallan = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { customerId, items } = req.body;
    const challan = await challanService.createChallan(customerId, items, userId);
    return sendSuccess(res, challan, 201);
  } catch (error) {
    next(error);
  }
};

export const updateChallan = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { customerId, items } = req.body;
    const challan = await challanService.updateChallan(req.params.id, customerId, items, userId);
    return sendSuccess(res, challan);
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const challan = await challanService.confirmChallan(req.params.id, userId);
    return sendSuccess(res, challan);
  } catch (error) {
    next(error);
  }
};

export const cancelChallan = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const challan = await challanService.cancelChallan(req.params.id, userId);
    return sendSuccess(res, challan);
  } catch (error) {
    next(error);
  }
};

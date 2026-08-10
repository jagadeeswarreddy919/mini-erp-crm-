import { Response, NextFunction } from 'express';
import * as customerService from './customer.service';
import { sendSuccess } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../../middleware/auth';

export const listCustomers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, status, customerType, page, limit } = req.query;
    const result = await customerService.getCustomers({
      search: search as string,
      status: status as string,
      customerType: customerType as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    return sendSuccess(res, customer);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    return sendSuccess(res, customer, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    return sendSuccess(res, customer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await customerService.deleteCustomer(req.params.id);
    return sendSuccess(res, { message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addFollowUp = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { note, followUpDate } = req.body;
    const followUp = await customerService.addFollowUpNote(
      req.params.id,
      userId,
      note,
      followUpDate
    );
    return sendSuccess(res, followUp, 201);
  } catch (error) {
    next(error);
  }
};

export const getFollowUps = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const followUps = await customerService.getCustomerFollowUps(req.params.id);
    return sendSuccess(res, followUps);
  } catch (error) {
    next(error);
  }
};

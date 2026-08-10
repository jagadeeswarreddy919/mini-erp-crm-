import { Response, NextFunction } from 'express';
import * as productService from './product.service';
import { sendSuccess } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../../middleware/auth';

export const listProducts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, category, stockStatus, page, limit } = req.query;
    const result = await productService.getProducts({
      search: search as string,
      category: category as string,
      stockStatus: stockStatus as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const product = await productService.createProduct(req.body, userId);
    return sendSuccess(res, product, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await productService.deleteProduct(req.params.id);
    return sendSuccess(res, { message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await productService.getProductCategories();
    return sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
};

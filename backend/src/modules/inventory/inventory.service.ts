import prisma from '../../config/db';
import { NotFoundError, ConflictError } from '../../utils/errors';

export interface MovementQueryOptions {
  productId?: string;
  type?: 'IN' | 'OUT';
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const getInventorySummary = async () => {
  const [totalProducts, lowStockProducts, outOfStockProducts, categoriesCount] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({
      where: {
        currentStock: { gt: 0 },
        // Simple stock alert check
      },
    }),
    prisma.product.count({ where: { currentStock: 0 } }),
    prisma.product.findMany({ select: { category: true }, distinct: ['category'] }),
  ]);

  const allProducts = await prisma.product.findMany({
    select: { currentStock: true, minStockAlert: true },
  });
  const lowStockCount = allProducts.filter(
    (p) => p.currentStock > 0 && p.currentStock <= p.minStockAlert
  ).length;

  return {
    totalProducts,
    lowStockCount,
    outOfStockCount: outOfStockProducts,
    totalCategories: categoriesCount.length,
  };
};

export const getStockMovements = async (options: MovementQueryOptions) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (options.productId) {
    where.productId = options.productId;
  }

  if (options.type) {
    where.type = options.type;
  }

  if (options.search) {
    const s = options.search.trim();
    where.OR = [
      { reason: { contains: s, mode: 'insensitive' } },
      { product: { name: { contains: s, mode: 'insensitive' } } },
      { product: { sku: { contains: s, mode: 'insensitive' } } },
    ];
  }

  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) {
      where.createdAt.gte = new Date(options.startDate);
    }
    if (options.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const [total, movements] = await Promise.all([
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { id: true, name: true, sku: true, category: true, currentStock: true, warehouseLocation: true },
        },
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    }),
  ]);

  return {
    movements,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const adjustStock = async (
  productId: string,
  quantity: number,
  type: 'IN' | 'OUT',
  reason: string,
  userId: string
) => {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (type === 'OUT' && product.currentStock < quantity) {
      throw new ConflictError(
        `Insufficient stock for "${product.name}". Available: ${product.currentStock}, Requested reduction: ${quantity}`
      );
    }

    const newStock = type === 'IN' ? product.currentStock + quantity : product.currentStock - quantity;

    await tx.product.update({
      where: { id: productId },
      data: { currentStock: newStock },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantity,
        type,
        reason,
        createdById: userId,
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true, currentStock: true },
        },
        createdBy: { select: { id: true, name: true, role: true } },
      },
    });

    return movement;
  });
};

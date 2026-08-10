import prisma from '../../config/db';
import { NotFoundError, ConflictError } from '../../utils/errors';

export interface ProductQueryOptions {
  search?: string;
  category?: string;
  stockStatus?: 'NORMAL' | 'LOW' | 'OUT';
  page?: number;
  limit?: number;
}

export const getProducts = async (options: ProductQueryOptions) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (options.category) {
    where.category = options.category;
  }

  if (options.search) {
    const s = options.search.trim();
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { sku: { contains: s, mode: 'insensitive' } },
      { category: { contains: s, mode: 'insensitive' } },
      { warehouseLocation: { contains: s, mode: 'insensitive' } },
    ];
  }

  // Stock status filter calculation
  if (options.stockStatus === 'OUT') {
    where.currentStock = 0;
  } else if (options.stockStatus === 'LOW') {
    where.currentStock = { gt: 0 };
    // Prisma allows raw or field filtering, or we filter in query if simple
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  // Map stock status badge info for each product
  const productsWithStatus = products.map((p) => {
    let stockStatus: 'NORMAL' | 'LOW' | 'OUT' = 'NORMAL';
    if (p.currentStock === 0) {
      stockStatus = 'OUT';
    } else if (p.currentStock <= p.minStockAlert) {
      stockStatus = 'LOW';
    }
    return {
      ...p,
      stockStatus,
    };
  });

  let filteredProducts = productsWithStatus;
  if (options.stockStatus === 'LOW') {
    filteredProducts = productsWithStatus.filter((p) => p.stockStatus === 'LOW');
  }

  return {
    products: filteredProducts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockMovements: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  let stockStatus: 'NORMAL' | 'LOW' | 'OUT' = 'NORMAL';
  if (product.currentStock === 0) {
    stockStatus = 'OUT';
  } else if (product.currentStock <= product.minStockAlert) {
    stockStatus = 'LOW';
  }

  return { ...product, stockStatus };
};

export const createProduct = async (data: any, userId?: string) => {
  const existingSku = await prisma.product.findUnique({
    where: { sku: data.sku.trim().toUpperCase() },
  });

  if (existingSku) {
    throw new ConflictError(`Product with SKU "${data.sku}" already exists`);
  }

  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...data,
        sku: data.sku.trim().toUpperCase(),
      },
    });

    if (data.currentStock > 0 && userId) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: data.currentStock,
          type: 'IN',
          reason: 'Initial stock on product creation',
          createdById: userId,
        },
      });
    }

    return product;
  });
};

export const updateProduct = async (id: string, data: any) => {
  await getProductById(id);

  if (data.sku) {
    const existingSku = await prisma.product.findFirst({
      where: {
        sku: data.sku.trim().toUpperCase(),
        NOT: { id },
      },
    });
    if (existingSku) {
      throw new ConflictError(`Product with SKU "${data.sku}" already exists`);
    }
    data.sku = data.sku.trim().toUpperCase();
  }

  return await prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id: string) => {
  await getProductById(id);
  return await prisma.product.delete({
    where: { id },
  });
};

export const getProductCategories = async () => {
  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
  });
  return categories.map((c) => c.category);
};

import prisma from '../../config/db';
import { NotFoundError, ConflictError, BadRequestError } from '../../utils/errors';

export interface ChallanQueryOptions {
  search?: string;
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

const generateChallanNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.challan.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `CH-${year}-${nextNum}`;
};

export const getChallans = async (options: ChallanQueryOptions) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (options.status) {
    where.status = options.status;
  }

  if (options.customerId) {
    where.customerId = options.customerId;
  }

  if (options.search) {
    const s = options.search.trim();
    where.OR = [
      { challanNumber: { contains: s, mode: 'insensitive' } },
      { customer: { name: { contains: s, mode: 'insensitive' } } },
      { customer: { businessName: { contains: s, mode: 'insensitive' } } },
      { customer: { mobile: { contains: s, mode: 'insensitive' } } },
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

  const [total, challans] = await Promise.all([
    prisma.challan.count({ where }),
    prisma.challan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, businessName: true, mobile: true, customerType: true },
        },
        createdBy: {
          select: { id: true, name: true, role: true },
        },
        _count: {
          select: { items: true },
        },
      },
    }),
  ]);

  return {
    challans,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getChallanById = async (id: string) => {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: {
        select: { id: true, name: true, role: true, email: true },
      },
      items: {
        include: {
          product: {
            select: { id: true, currentStock: true, minStockAlert: true, warehouseLocation: true },
          },
        },
      },
    },
  });

  if (!challan) {
    throw new NotFoundError('Sales Challan not found');
  }

  return challan;
};

export const createChallan = async (
  customerId: string,
  itemsData: { productId: string; quantity: number; unitPrice?: number }[],
  userId: string
) => {
  // Validate customer existence
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  // Fetch all requested products to capture historical snapshots
  const productIds = itemsData.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalQuantity = 0;
  let totalAmount = 0;

  const itemsToCreate = itemsData.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new NotFoundError(`Product with ID "${item.productId}" not found`);
    }

    const price = item.unitPrice !== undefined ? item.unitPrice : product.unitPrice;
    const lineTotal = price * item.quantity;

    totalQuantity += item.quantity;
    totalAmount += lineTotal;

    return {
      productId: product.id,
      productNameSnapshot: product.name,
      skuSnapshot: product.sku,
      unitPriceSnapshot: price,
      quantity: item.quantity,
      lineTotal,
    };
  });

  const challanNumber = await generateChallanNumber();

  const challan = await prisma.challan.create({
    data: {
      challanNumber,
      customerId,
      totalQuantity,
      totalAmount,
      status: 'DRAFT',
      createdById: userId,
      items: {
        create: itemsToCreate,
      },
    },
    include: {
      customer: { select: { id: true, name: true, businessName: true } },
      items: true,
    },
  });

  return challan;
};

export const updateChallan = async (
  id: string,
  customerId?: string,
  itemsData?: { productId: string; quantity: number; unitPrice?: number }[],
  userId?: string
) => {
  const existingChallan = await getChallanById(id);

  if (existingChallan.status !== 'DRAFT') {
    throw new BadRequestError(`Cannot edit challan in "${existingChallan.status}" status`);
  }

  return await prisma.$transaction(async (tx) => {
    if (itemsData && itemsData.length > 0) {
      // Delete existing items
      await tx.challanItem.deleteMany({
        where: { challanId: id },
      });

      const productIds = itemsData.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      let totalQuantity = 0;
      let totalAmount = 0;

      const itemsToCreate = itemsData.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundError(`Product with ID "${item.productId}" not found`);
        }

        const price = item.unitPrice !== undefined ? item.unitPrice : product.unitPrice;
        const lineTotal = price * item.quantity;

        totalQuantity += item.quantity;
        totalAmount += lineTotal;

        return {
          productId: product.id,
          productNameSnapshot: product.name,
          skuSnapshot: product.sku,
          unitPriceSnapshot: price,
          quantity: item.quantity,
          lineTotal,
        };
      });

      await tx.challanItem.createMany({
        data: itemsToCreate.map((item) => ({ ...item, challanId: id })),
      });

      return await tx.challan.update({
        where: { id },
        data: {
          customerId: customerId || existingChallan.customerId,
          totalQuantity,
          totalAmount,
        },
        include: { customer: true, items: true },
      });
    } else if (customerId) {
      return await tx.challan.update({
        where: { id },
        data: { customerId },
        include: { customer: true, items: true },
      });
    }

    return existingChallan;
  });
};

/**
 * ATOMIC TRANSACTION FOR CONFIRMING A SALES CHALLAN
 * Checks product stock, reduces stock, creates StockMovement logs, updates status.
 */
export const confirmChallan = async (id: string, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    if (challan.status === 'CONFIRMED') {
      throw new ConflictError('Challan is already confirmed');
    }

    if (challan.status === 'CANCELLED') {
      throw new BadRequestError('Cannot confirm a cancelled challan');
    }

    // Collect all product IDs and fetch current stock
    const productIds = challan.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Stock verification check
    const insufficientStockErrors: string[] = [];

    for (const item of challan.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundError(`Product "${item.productNameSnapshot}" no longer exists`);
      }

      if (product.currentStock < item.quantity) {
        insufficientStockErrors.push(
          `Insufficient stock for "${product.name}" (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}`
        );
      }
    }

    if (insufficientStockErrors.length > 0) {
      throw new ConflictError(
        `Cannot confirm challan ${challan.challanNumber}. ${insufficientStockErrors.join('; ')}`,
        insufficientStockErrors
      );
    }

    // If all products have adequate stock, perform atomic stock deduction & log movement
    for (const item of challan.items) {
      const product = productMap.get(item.productId)!;
      const updatedStock = product.currentStock - item.quantity;

      // Update product currentStock
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: updatedStock },
      });

      // Record StockMovement OUT
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: 'OUT',
          reason: `Sales Challan #${challan.challanNumber} Confirmed`,
          createdById: userId,
        },
      });
    }

    // Mark Challan as CONFIRMED
    const updatedChallan = await tx.challan.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return updatedChallan;
  });
};

/**
 * CANCEL CHALLAN
 * If confirmed, restores product stock and logs IN stock movements atomically.
 */
export const cancelChallan = async (id: string, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    if (challan.status === 'CANCELLED') {
      throw new ConflictError('Challan is already cancelled');
    }

    if (challan.status === 'CONFIRMED') {
      // Restore stock for each item
      for (const item of challan.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          const restoredStock = product.currentStock + item.quantity;
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: restoredStock },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'IN',
              reason: `Sales Challan #${challan.challanNumber} Cancelled - Stock Restored`,
              createdById: userId,
            },
          });
        }
      }
    }

    const cancelledChallan = await tx.challan.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return cancelledChallan;
  });
};
